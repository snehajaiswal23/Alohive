import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/business/[id]/visits/today">) {
  const { id } = await ctx.params
  // TODO: fetch today's visits
  return Response.json({ businessId: id, count: 24, visits: [] })
}
