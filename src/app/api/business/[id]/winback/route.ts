import { NextRequest, NextResponse } from "next/server"
import { requireOwner } from "@/lib/api-auth"
import { createWinbackCampaign, listWinbackCampaigns, CampaignError } from "@/lib/campaigns"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/winback">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const campaigns = await listWinbackCampaigns(id)
  return NextResponse.json({ campaigns })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/winback">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const { name, triggerDays, messageTemplate, offer } = await req.json()

  try {
    const campaign = await createWinbackCampaign(id, { name, triggerDays: Number(triggerDays), messageTemplate, offer })
    return NextResponse.json({ campaign }, { status: 201 })
  } catch (e) {
    if (e instanceof CampaignError) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    throw e
  }
}
