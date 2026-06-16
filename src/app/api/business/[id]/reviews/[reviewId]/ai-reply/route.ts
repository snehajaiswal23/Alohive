import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/business/[id]/reviews/[reviewId]/ai-reply">) {
  const { id, reviewId } = await ctx.params
  // TODO: fetch review text, call OpenAI/Claude to draft a reply in the business's tone
  return Response.json({
    businessId: id,
    reviewId,
    suggestedReply: "Thank you so much for the kind words! We're thrilled you enjoyed your experience and we look forward to welcoming you back soon. 🙏",
  })
}
