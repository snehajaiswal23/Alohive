import { prisma } from "@/lib/prisma"
import { findPlaceId, buildReviewLink } from "@/lib/google/places"

interface BusinessProfile {
  id: string
  name: string
  city: string
  locality: string | null
  googlePlaceId: string | null
  googleReviewLink: string | null
}

export async function getOrCreateReviewLink(business: BusinessProfile): Promise<string | null> {
  if (business.googleReviewLink) return business.googleReviewLink

  let placeId = business.googlePlaceId
  if (!placeId) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) return null
    const query = [business.name, business.locality, business.city].filter(Boolean).join(", ")
    placeId = await findPlaceId(query, apiKey)
    if (!placeId) return null
  }

  const reviewLink = buildReviewLink(placeId)
  await prisma.business.update({
    where: { id: business.id },
    data: { googlePlaceId: placeId, googleReviewLink: reviewLink },
  })
  return reviewLink
}
