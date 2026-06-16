import { NextRequest } from "next/server"

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/reviews/[reviewId]/reply">) {
  const { id, reviewId } = await ctx.params
  const { replyText } = await req.json()
  if (!replyText) return Response.json({ error: "replyText required" }, { status: 400 })
  // TODO: post reply to Google Business Profile API
  return Response.json({ businessId: id, reviewId, replyText, postedAt: new Date().toISOString() })
}
