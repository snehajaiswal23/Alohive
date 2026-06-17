import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/api-auth"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/competitors">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const competitors = await prisma.competitor.findMany({
    where: { businessId: id },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json({ competitors })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/competitors">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const { googleMapsUrl, competitorName } = await req.json()
  if (!googleMapsUrl && !competitorName) {
    return NextResponse.json({ error: "googleMapsUrl or competitorName required" }, { status: 400 })
  }

  // Extract place_id from Google Maps URL if present (e.g. ?cid=... or /place/...)
  let googlePlaceId: string | null = null
  if (googleMapsUrl) {
    const cidMatch = String(googleMapsUrl).match(/[?&]cid=(\d+)/)
    const placeMatch = String(googleMapsUrl).match(/\/place\/[^/]+\/([A-Za-z0-9_-]+)/)
    googlePlaceId = (cidMatch?.[1] ?? placeMatch?.[1]) || null
  }

  const competitor = await prisma.competitor.create({
    data: {
      businessId: id,
      competitorName: competitorName ?? "Unknown",
      googlePlaceId,
      lastSynced: null,
    },
  })

  // If we have a Maps API key and a placeId, kick off a sync
  if (googlePlaceId && process.env.GOOGLE_MAPS_API_KEY) {
    try {
      const { findPlaceDetails } = await import("@/lib/google/places")
      const details = await findPlaceDetails(googlePlaceId, process.env.GOOGLE_MAPS_API_KEY)
      if (details) {
        await prisma.competitor.update({
          where: { id: competitor.id },
          data: {
            competitorName: details.name ?? competitor.competitorName,
            rating: details.rating ?? null,
            reviewCount: details.userRatingsTotal ?? null,
            lastSynced: new Date(),
          },
        })
      }
    } catch {
      // Non-fatal — basic record is already saved
    }
  }

  const updated = await prisma.competitor.findUnique({ where: { id: competitor.id } })
  return NextResponse.json(updated, { status: 201 })
}
