import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember, requireOwner } from "@/lib/api-auth"
import { getLoyaltyConfig } from "@/lib/loyalty"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/loyalty/config">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const config = await getLoyaltyConfig(id)
  return NextResponse.json(config)
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/business/[id]/loyalty/config">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const body = await req.json()
  const { pointsPerVisit, pointsPerReview, pointsPerReferral, tierThresholds } = body

  for (const value of [pointsPerVisit, pointsPerReview, pointsPerReferral]) {
    if (typeof value !== "number" || value < 0 || !Number.isInteger(value)) {
      return NextResponse.json({ error: "Points values must be non-negative integers" }, { status: 400 })
    }
  }
  if (
    !tierThresholds ||
    typeof tierThresholds.Silver !== "number" ||
    typeof tierThresholds.Gold !== "number" ||
    typeof tierThresholds.Platinum !== "number" ||
    !(tierThresholds.Silver < tierThresholds.Gold && tierThresholds.Gold < tierThresholds.Platinum)
  ) {
    return NextResponse.json({ error: "Tier thresholds must be increasing numbers (Silver < Gold < Platinum)" }, { status: 400 })
  }

  const config = await prisma.loyaltyConfig.upsert({
    where: { businessId: id },
    update: { pointsPerVisit, pointsPerReview, pointsPerReferral, tierThresholds },
    create: { businessId: id, pointsPerVisit, pointsPerReview, pointsPerReferral, tierThresholds },
  })

  return NextResponse.json(config)
}
