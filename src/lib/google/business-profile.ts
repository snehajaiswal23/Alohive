type GoogleResult<T> = { ok: true; data: T } | { ok: false; error: string }

const STAR_RATING: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
}

interface GoogleReviewRaw {
  reviewId: string
  reviewer?: { displayName?: string }
  starRating: string
  comment?: string
  createTime: string
  reviewReply?: { comment?: string }
}

export interface ParsedGoogleReview {
  googleReviewId: string
  reviewerName: string
  rating: number
  reviewText: string | null
  replyText: string | null
  publishedAt: Date
}

async function googleGet<T>(url: string, accessToken: string): Promise<GoogleResult<T>> {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: data.error?.message || `Google API request failed (${res.status})` }
    }
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error reaching Google" }
  }
}

export async function fetchFirstAccountId(accessToken: string): Promise<GoogleResult<string>> {
  const result = await googleGet<{ accounts?: { name: string }[] }>(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    accessToken,
  )
  if (!result.ok) return result
  const accountName = result.data.accounts?.[0]?.name
  if (!accountName) return { ok: false, error: "No Google Business Profile account found for this user" }
  return { ok: true, data: accountName.replace("accounts/", "") }
}

export async function fetchFirstLocationId(accessToken: string, accountId: string): Promise<GoogleResult<string>> {
  const result = await googleGet<{ locations?: { name: string }[] }>(
    `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name`,
    accessToken,
  )
  if (!result.ok) return result
  const locationName = result.data.locations?.[0]?.name
  if (!locationName) return { ok: false, error: "No Business Profile location found for this account" }
  return { ok: true, data: locationName.replace("locations/", "") }
}

export async function fetchReviews(
  accessToken: string,
  accountId: string,
  locationId: string,
): Promise<GoogleResult<ParsedGoogleReview[]>> {
  const reviews: ParsedGoogleReview[] = []
  let pageToken: string | undefined

  do {
    const url = new URL(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`,
    )
    if (pageToken) url.searchParams.set("pageToken", pageToken)

    const result = await googleGet<{ reviews?: GoogleReviewRaw[]; nextPageToken?: string }>(
      url.toString(),
      accessToken,
    )
    if (!result.ok) return result

    for (const r of result.data.reviews ?? []) {
      reviews.push({
        googleReviewId: r.reviewId,
        reviewerName: r.reviewer?.displayName || "Anonymous",
        rating: STAR_RATING[r.starRating] ?? 0,
        reviewText: r.comment || null,
        replyText: r.reviewReply?.comment || null,
        publishedAt: new Date(r.createTime),
      })
    }
    pageToken = result.data.nextPageToken
  } while (pageToken)

  return { ok: true, data: reviews }
}

async function googlePut<T>(url: string, accessToken: string, body: unknown): Promise<GoogleResult<T>> {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: data.error?.message || `Google API request failed (${res.status})` }
    }
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error reaching Google" }
  }
}

async function googleDelete(url: string, accessToken: string): Promise<GoogleResult<void>> {
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { ok: false, error: data.error?.message || `Google API request failed (${res.status})` }
    }
    return { ok: true, data: undefined }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error reaching Google" }
  }
}

export async function postReviewReply(
  accessToken: string,
  accountId: string,
  locationId: string,
  googleReviewId: string,
  replyText: string,
): Promise<GoogleResult<void>> {
  const url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${googleReviewId}/reply`
  const result = await googlePut<unknown>(url, accessToken, { comment: replyText })
  if (!result.ok) return result
  return { ok: true, data: undefined }
}

export async function deleteReviewReply(
  accessToken: string,
  accountId: string,
  locationId: string,
  googleReviewId: string,
): Promise<GoogleResult<void>> {
  const url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${googleReviewId}/reply`
  return googleDelete(url, accessToken)
}
