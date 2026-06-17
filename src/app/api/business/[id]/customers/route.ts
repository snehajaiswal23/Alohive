import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember } from "@/lib/api-auth"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/customers">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") ?? "").trim()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 10))
  const digits = q.replace(/\D/g, "")

  const where = {
    businessId: id,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            ...(digits ? [{ phone: { contains: digits } }] : []),
          ],
        }
      : {}),
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { lastVisitAt: { sort: "desc", nulls: "last" } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where }),
  ])

  return NextResponse.json({ customers, total, page, pageSize })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/customers">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const { phone, name } = await req.json()
  if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 })
  if (!name)  return NextResponse.json({ error: "Name required" },  { status: 400 })

  const { normalizePhone } = await import("@/lib/phone")
  const normalizedPhone = normalizePhone(phone)
  if (normalizedPhone.length < 10) {
    return NextResponse.json({ error: "A valid 10-digit phone number is required" }, { status: 400 })
  }

  const existing = await prisma.customer.findFirst({ where: { businessId: id, phone: normalizedPhone } })
  if (existing) return NextResponse.json(existing)

  const customer = await prisma.customer.create({ data: { businessId: id, name, phone: normalizedPhone } })
  return NextResponse.json(customer, { status: 201 })
}
