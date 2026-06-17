import { NextRequest, NextResponse } from "next/server"
import { requireBusinessMember } from "@/lib/api-auth"
import { getLoyaltyConfig, getRewardCatalog } from "@/lib/loyalty"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/loyalty/rewards">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const config = await getLoyaltyConfig(id)
  return NextResponse.json({ rewards: getRewardCatalog(config) })
}
