import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember } from "@/lib/api-auth"
import { generateReviewReply } from "@/lib/ai-review-reply"

type Ctx = { params: Promise<{ id: string; reviewId: string }> }

// GET — return cached suggestion or generate a new one
export async function GET(req: NextRequest, ctx: Ctx) {
  const { id, reviewId } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const review = await prisma.googleReview.findFirst({
    where: { id: reviewId, businessId: id },
    select: {
      id: true,
      reviewerName: true,
      rating: true,
      reviewText: true,
      aiSuggestedReply: true,
      business: { select: { name: true } },
    },
  })

  if (!review) return Response.json({ error: "Review not found" }, { status: 404 })

  if (review.aiSuggestedReply) {
    return Response.json({ suggestion: review.aiSuggestedReply, cached: true })
  }

  const suggestion = await generateReviewReply({
    businessName: review.business.name,
    reviewerName: review.reviewerName,
    rating: review.rating,
    reviewText: review.reviewText,
  })

  await prisma.googleReview.update({
    where: { id: reviewId },
    data: { aiSuggestedReply: suggestion },
  })

  return Response.json({ suggestion, cached: false })
}
