import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/business/[id]/reviews">) {
  const { id } = await ctx.params
  return Response.json({ businessId: id, reviews: [], total: 0 })
}
