import { NextRequest, NextResponse } from "next/server"
import { requireOwner } from "@/lib/api-auth"
import { getCampaignStats, CampaignError } from "@/lib/campaigns"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/winback/[campaignId]/stats">) {
  const { id, campaignId } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  try {
    const stats = await getCampaignStats(id, campaignId)
    return NextResponse.json({ stats })
  } catch (e) {
    if (e instanceof CampaignError) {
      return NextResponse.json({ error: e.message }, { status: 404 })
    }
    throw e
  }
}
