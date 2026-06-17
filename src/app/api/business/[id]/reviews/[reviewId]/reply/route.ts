import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/api-auth"
import { getValidAccessToken } from "@/lib/google/oauth"
import { postReviewReply } from "@/lib/google/business-profile"

type Ctx = { params: Promise<{ id: string; reviewId: string }> }

// POST — post a reply to Google Business Profile and save locally
export async function POST(req: NextRequest, ctx: Ctx) {
  const { id, reviewId } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const body = await req.json() as { replyText?: string }
  const replyText = body.replyText?.trim()
  if (!replyText) return Response.json({ error: "replyText is required" }, { status: 400 })

  const review = await prisma.googleReview.findFirst({
    where: { id: reviewId, businessId: id },
    select: { id: true, googleReviewId: true },
  })
  if (!review) return Response.json({ error: "Review not found" }, { status: 404 })

  // Always save the reply locally, even if Google posting fails
  await prisma.googleReview.update({
    where: { id: reviewId },
    data: { replyText },
  })

  // Attempt to post to Google if the review has a googleReviewId
  if (review.googleReviewId) {
    const config = await prisma.googleOAuthConfig.findUnique({
      where: { businessId: id },
      select: { accountId: true, locationId: true, isConnected: true },
    })

    if (config?.isConnected && config.accountId && config.locationId) {
      const tokenResult = await getValidAccessToken(id)
      if (tokenResult.ok) {
        const postResult = await postReviewReply(
          tokenResult.data,
          config.accountId,
          config.locationId,
          review.googleReviewId,
          replyText,
        )
        if (!postResult.ok) {
          return Response.json({
            ok: true,
            savedLocally: true,
            postedToGoogle: false,
            googleError: postResult.error,
          })
        }
        return Response.json({ ok: true, savedLocally: true, postedToGoogle: true })
      }
    }
  }

  return Response.json({ ok: true, savedLocally: true, postedToGoogle: false })
}
