import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember } from "@/lib/api-auth"
import { normalizePhone } from "@/lib/phone"
import { awardLoyaltyPoints } from "@/lib/loyalty"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/visits">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const page  = Math.max(1, Number(searchParams.get("page")) || 1)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20))
  const skip  = (page - 1) * limit

  const [visits, total] = await Promise.all([
    prisma.visit.findMany({
      where: { businessId: id },
      orderBy: { visitedAt: "desc" },
      skip,
      take: limit,
      include: {
        customer: { select: { id: true, name: true, phone: true, loyaltyTier: true } },
        staff:    { select: { id: true, name: true } },
        feedback: { select: { score: true, sentiment: true } },
      },
    }),
    prisma.visit.count({ where: { businessId: id } }),
  ])

  return Response.json({ visits, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/visits">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const { phone, customerName, serviceId, staffId, billAmount } = await req.json()

  const normalizedPhone = normalizePhone(phone || "")
  if (normalizedPhone.length < 10) {
    return NextResponse.json({ error: "A valid phone number is required" }, { status: 400 })
  }
  if (!serviceId) {
    return NextResponse.json({ error: "Service is required" }, { status: 400 })
  }

  const service = await prisma.service.findFirst({ where: { id: serviceId, businessId: id } })
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 })
  }

  if (staffId) {
    const staff = await prisma.staff.findFirst({ where: { id: staffId, businessId: id } })
    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
    }
  }

  let customer = await prisma.customer.findFirst({ where: { businessId: id, phone: normalizedPhone } })
  const isNewCustomer = !customer

  if (!customer) {
    if (!customerName) {
      return NextResponse.json({ error: "Customer name is required for new customers" }, { status: 400 })
    }
    customer = await prisma.customer.create({
      data: { businessId: id, name: customerName, phone: normalizedPhone },
    })
  }

  const wasFirstVisit = customer.totalVisits === 0

  const { visit, updatedCustomer, pointsAwarded } = await prisma.$transaction(async (tx) => {
    const visit = await tx.visit.create({
      data: {
        businessId: id,
        customerId: customer!.id,
        staffId: staffId || null,
        service: service.name,
        billAmount: billAmount ?? null,
      },
    })

    await tx.customer.update({
      where: { id: customer!.id },
      data: { totalVisits: { increment: 1 }, lastVisitAt: new Date() },
    })

    const award = await awardLoyaltyPoints(tx, id, customer!.id, "visit", `Visit – ${service.name}`)
    let referralBonus = 0

    if (wasFirstVisit) {
      const pendingReferral = await tx.referral.findFirst({
        where: { businessId: id, referredCustomerId: customer!.id, status: "pending" },
      })
      if (pendingReferral) {
        await tx.referral.update({
          where: { id: pendingReferral.id },
          data: { status: "completed", rewardGiven: true },
        })
        await awardLoyaltyPoints(tx, id, pendingReferral.referrerCustomerId, "referral", `Referral converted – ${customer!.name}`)
        const refereeAward = await awardLoyaltyPoints(tx, id, customer!.id, "referral", "Referral welcome bonus")
        referralBonus = refereeAward.points
      }
    }

    const updatedCustomer = await tx.customer.findUniqueOrThrow({ where: { id: customer!.id } })
    return { visit, updatedCustomer, pointsAwarded: award.points + referralBonus }
  })

  return NextResponse.json(
    { visit, customer: updatedCustomer, pointsAwarded, isNewCustomer },
    { status: 201 },
  )
}
