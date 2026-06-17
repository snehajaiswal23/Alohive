import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember } from "@/lib/api-auth"
import { awardLoyaltyPoints } from "@/lib/loyalty"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/reviews">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const reviews = await prisma.googleReview.findMany({
    where: { businessId: id },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  })

  return NextResponse.json({ businessId: id, reviews, total: reviews.length })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/reviews">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const { customerId, rating, reviewText, reviewerName } = await req.json()

  if (typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: "Rating must be an integer from 1 to 5" }, { status: 400 })
  }

  let customer = null
  if (customerId) {
    customer = await prisma.customer.findFirst({ where: { id: customerId, businessId: id } })
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.googleReview.create({
      data: {
        businessId: id,
        customerId: customer?.id ?? null,
        reviewerName: reviewerName || customer?.name || "Anonymous",
        rating,
        reviewText: reviewText || null,
      },
    })

    const award = customer
      ? await awardLoyaltyPoints(tx, id, customer.id, "review", `Google review – ${rating}★`)
      : null

    return { review, pointsAwarded: award?.points ?? 0 }
  })

  return NextResponse.json(result, { status: 201 })
}
