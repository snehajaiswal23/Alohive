import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/business/[id]/reviews/stats">) {
  const { id } = await ctx.params
  return Response.json({ businessId: id, averageRating: 4.7, totalReviews: 142, thisMonth: 18, lastMonth: 15 })
}
