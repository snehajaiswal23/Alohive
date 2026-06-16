import { NextRequest } from "next/server"

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/loyalty/redeem">) {
  const { id } = await ctx.params
  const { customerId, points, rewardLabel } = await req.json()
  if (!customerId || !points) return Response.json({ error: "customerId and points required" }, { status: 400 })
  // TODO: deduct points, create LoyaltyTransaction, verify balance
  return Response.json({ success: true, businessId: id, customerId, pointsDeducted: points, rewardLabel, newBalance: 920 })
}
