import { NextRequest, NextResponse } from "next/server"
import { requireOwner } from "@/lib/api-auth"
import { setCampaignStatus, CampaignError } from "@/lib/campaigns"

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/business/[id]/winback/[campaignId]">) {
  const { id, campaignId } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const { status } = await req.json()
  if (status !== "active" && status !== "paused") {
    return NextResponse.json({ error: "status must be 'active' or 'paused'" }, { status: 400 })
  }

  try {
    const campaign = await setCampaignStatus(id, campaignId, status)
    return NextResponse.json({ campaign })
  } catch (e) {
    if (e instanceof CampaignError) {
      return NextResponse.json({ error: e.message }, { status: 404 })
    }
    throw e
  }
}
