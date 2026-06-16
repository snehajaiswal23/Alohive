import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/business/[id]/competitors">) {
  const { id } = await ctx.params
  return Response.json({ businessId: id, competitors: [] })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/competitors">) {
  const { id } = await ctx.params
  const { googleMapsUrl, competitorName } = await req.json()
  if (!googleMapsUrl) return Response.json({ error: "googleMapsUrl required" }, { status: 400 })
  // TODO: extract place_id from URL, call Places API to get rating/review count
  return Response.json({ id: "comp_new", businessId: id, competitorName, googleMapsUrl, rating: null, reviewCount: null }, { status: 201 })
}
