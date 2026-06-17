import { NextRequest, NextResponse } from "next/server"
import { requireBusinessMember } from "@/lib/api-auth"
import { redeemLoyaltyPoints, RedemptionError } from "@/lib/loyalty"

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/loyalty/redeem">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const { customerId, rewardId } = await req.json()
  if (!customerId || !rewardId) {
    return NextResponse.json({ error: "customerId and rewardId required" }, { status: 400 })
  }

  try {
    const { reward, newTotal, newTier } = await redeemLoyaltyPoints(id, customerId, rewardId)
    return NextResponse.json({ success: true, reward, newBalance: newTotal, newTier })
  } catch (e) {
    if (e instanceof RedemptionError) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    throw e
  }
}
