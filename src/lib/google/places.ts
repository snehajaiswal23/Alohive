const PLACES_BASE = "https://maps.googleapis.com/maps/api/place"

export function buildReviewLink(placeId: string) {
  return `https://search.google.com/local/writereview?placeid=${placeId}`
}

export async function findPlaceDetails(
  placeId: string,
  apiKey: string,
): Promise<{ name?: string; rating?: number; userRatingsTotal?: number } | null> {
  const url = `${PLACES_BASE}/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total&key=${apiKey}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.status !== "OK") return null
    const r = data.result
    return { name: r.name, rating: r.rating, userRatingsTotal: r.user_ratings_total }
  } catch (e) {
    console.error("Google Place Details lookup failed:", e)
    return null
  }
}

export async function findPlaceId(query: string, apiKey: string): Promise<string | null> {
  const url = `${PLACES_BASE}/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${apiKey}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.status !== "OK") return null
    return data.candidates?.[0]?.place_id ?? null
  } catch (e) {
    console.error("Google Places lookup failed:", e)
    return null
  }
}
