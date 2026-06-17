import { prisma } from "@/lib/prisma"
import { refreshAccessToken } from "@/lib/google/oauth"
import { fetchFirstAccountId, fetchFirstLocationId, fetchReviews } from "@/lib/google/business-profile"

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000
const TREND_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

async function getValidAccessToken(config: {
  id: string
  accessToken: string
  refreshToken: string
  expiresAt: Date
}): Promise<{ ok: true; accessToken: string } | { ok: false; error: string }> {
  if (config.expiresAt.getTime() - Date.now() > TOKEN_REFRESH_BUFFER_MS) {
    return { ok: true, accessToken: config.accessToken }
  }

  const result = await refreshAccessToken(config.refreshToken)
  if (!result.ok) return { ok: false, error: result.error }

  await prisma.googleOAuthConfig.update({
    where: { id: config.id },
    data: { accessToken: result.data.accessToken, expiresAt: result.data.expiresAt, lastError: null },
  })
  return { ok: true, accessToken: result.data.accessToken }
}

export async function syncReviewsForBusiness(businessId: string) {
  const config = await prisma.googleOAuthConfig.findUnique({ where: { businessId } })
  if (!config?.isConnected) return { newReviews: 0, updatedReviews: 0, skipped: true }

  const tokenResult = await getValidAccessToken(config)
  if (!tokenResult.ok) {
    await prisma.googleOAuthConfig.update({ where: { id: config.id }, data: { lastError: tokenResult.error } })
    return { newReviews: 0, updatedReviews: 0, skipped: true, error: tokenResult.error }
  }
  const accessToken = tokenResult.accessToken

  let accountId = config.accountId
  let locationId = config.locationId

  if (!accountId) {
    const accountResult = await fetchFirstAccountId(accessToken)
    if (!accountResult.ok) {
      await prisma.googleOAuthConfig.update({ where: { id: config.id }, data: { lastError: accountResult.error } })
      return { newReviews: 0, updatedReviews: 0, skipped: true, error: accountResult.error }
    }
    accountId = accountResult.data
  }

  if (!locationId) {
    const locationResult = await fetchFirstLocationId(accessToken, accountId)
    if (!locationResult.ok) {
      await prisma.googleOAuthConfig.update({ where: { id: config.id }, data: { lastError: locationResult.error } })
      return { newReviews: 0, updatedReviews: 0, skipped: true, error: locationResult.error }
    }
    locationId = locationResult.data
  }

  const reviewsResult = await fetchReviews(accessToken, accountId, locationId)
  if (!reviewsResult.ok) {
    await prisma.googleOAuthConfig.update({ where: { id: config.id }, data: { lastError: reviewsResult.error } })
    return { newReviews: 0, updatedReviews: 0, skipped: true, error: reviewsResult.error }
  }

  let newReviews = 0
  let updatedReviews = 0

  for (const review of reviewsResult.data) {
    const existing = await prisma.googleReview.findUnique({ where: { googleReviewId: review.googleReviewId } })
    if (!existing) {
      await prisma.googleReview.create({
        data: {
          businessId,
          reviewerName: review.reviewerName,
          rating: review.rating,
          reviewText: review.reviewText,
          replyText: review.replyText,
          googleReviewId: review.googleReviewId,
          publishedAt: review.publishedAt,
        },
      })
      newReviews++
    } else if (existing.replyText !== review.replyText || existing.rating !== review.rating) {
      await prisma.googleReview.update({
        where: { id: existing.id },
        data: { rating: review.rating, reviewText: review.reviewText, replyText: review.replyText },
      })
      updatedReviews++
    }
  }

  await prisma.googleOAuthConfig.update({
    where: { id: config.id },
    data: { accountId, locationId, lastSyncedAt: new Date(), lastError: null },
  })

  return { newReviews, updatedReviews, skipped: false }
}

export async function syncAllGoogleReviews() {
  const configs = await prisma.googleOAuthConfig.findMany({ where: { isConnected: true }, select: { businessId: true } })

  let businessesSynced = 0
  let businessesFailed = 0
  let totalNewReviews = 0
  let totalUpdatedReviews = 0

  for (const config of configs) {
    const result = await syncReviewsForBusiness(config.businessId)
    if (result.error) {
      businessesFailed++
    } else {
      businessesSynced++
      totalNewReviews += result.newReviews
      totalUpdatedReviews += result.updatedReviews
    }
  }

  return {
    businessesProcessed: configs.length,
    businessesSynced,
    businessesFailed,
    totalNewReviews,
    totalUpdatedReviews,
  }
}

export async function calculateRatingTrend(businessId: string) {
  const now = new Date()
  const windowStart = new Date(now.getTime() - TREND_WINDOW_MS)
  const previousWindowStart = new Date(now.getTime() - 2 * TREND_WINDOW_MS)

  const [recent, previous] = await Promise.all([
    prisma.googleReview.aggregate({
      where: { businessId, publishedAt: { gte: windowStart } },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    prisma.googleReview.aggregate({
      where: { businessId, publishedAt: { gte: previousWindowStart, lt: windowStart } },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ])

  const recentAvg = recent._avg.rating
  const previousAvg = previous._avg.rating

  if (recentAvg == null || previousAvg == null) {
    return { recentAvg, previousAvg, trend: null as "up" | "down" | "flat" | null, delta: null }
  }

  const delta = recentAvg - previousAvg
  const trend = delta > 0.05 ? "up" : delta < -0.05 ? "down" : "flat"

  return { recentAvg, previousAvg, trend, delta }
}
