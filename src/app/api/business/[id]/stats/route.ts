import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/business/[id]/stats">) {
  const { id } = await ctx.params
  // TODO: aggregate visits, reviews, loyalty stats for the business
  return Response.json({
    businessId: id,
    visitsToday: 24,
    newGoogleReviews: 7,
    pointsRedeemedToday: 1240,
    winbackSentToday: 12,
    averageRating: 4.7,
    totalReviews: 142,
  })
}
