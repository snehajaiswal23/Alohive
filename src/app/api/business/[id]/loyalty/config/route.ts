import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/business/[id]/loyalty/config">) {
  const { id } = await ctx.params
  return Response.json({ businessId: id, pointsPerVisit: 10, pointsPerReview: 50, pointsPerReferral: 100, tierThresholds: { Silver: 300, Gold: 800, Platinum: 2000 } })
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/business/[id]/loyalty/config">) {
  const { id } = await ctx.params
  const body = await req.json()
  return Response.json({ businessId: id, ...body })
}
