import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/api-auth"
import { sendCampaignMessage } from "@/lib/whatsapp/send-campaign-message"

export type AudienceFilter = "all" | "top_tier" | "inactive_30d" | "high_value" | "new_customers"

const MAX_BATCH = 300 // safety cap to avoid serverless timeouts

async function buildAudience(businessId: string, filter: AudienceFilter) {
  const base = { businessId }
  switch (filter) {
    case "all":
      return prisma.customer.findMany({ where: base, take: MAX_BATCH, select: { id: true, name: true, phone: true } })

    case "top_tier":
      return prisma.customer.findMany({
        where: { ...base, loyaltyTier: { in: ["Gold", "Platinum"] } },
        take: MAX_BATCH,
        select: { id: true, name: true, phone: true },
      })

    case "inactive_30d": {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return prisma.customer.findMany({
        where: { ...base, OR: [{ lastVisitAt: { lt: cutoff } }, { lastVisitAt: null }] },
        take: MAX_BATCH,
        select: { id: true, name: true, phone: true },
      })
    }

    case "high_value":
      return prisma.customer.findMany({
        where: { ...base, totalVisits: { gte: 5 } },
        take: MAX_BATCH,
        select: { id: true, name: true, phone: true },
      })

    case "new_customers": {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return prisma.customer.findMany({
        where: { ...base, createdAt: { gte: cutoff } },
        take: MAX_BATCH,
        select: { id: true, name: true, phone: true },
      })
    }
  }
}

function renderMessage(template: string, customerName: string, businessName: string): string {
  return template
    .replaceAll("{name}", customerName)
    .replaceAll("{{name}}", customerName)
    .replaceAll("{business}", businessName)
    .replaceAll("{{business}}", businessName)
}

type Ctx = { params: Promise<{ id: string }> }

// GET — return audience count for a given filter
export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const filter = (req.nextUrl.searchParams.get("filter") ?? "all") as AudienceFilter
  const customers = await buildAudience(id, filter)
  return Response.json({ count: customers.length, capped: customers.length >= MAX_BATCH })
}

// POST — create campaign record and send messages
export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const body = await req.json() as {
    name?: string
    messageTemplate?: string
    audienceFilter?: AudienceFilter
  }

  const { name, messageTemplate, audienceFilter = "all" } = body

  if (!name?.trim()) return Response.json({ error: "Campaign name is required" }, { status: 400 })
  if (!messageTemplate?.trim()) return Response.json({ error: "Message template is required" }, { status: 400 })

  const business = await prisma.business.findUnique({
    where: { id },
    select: { id: true, name: true, whatsappNumber: true },
  })
  if (!business) return Response.json({ error: "Business not found" }, { status: 404 })

  const customers = await buildAudience(id, audienceFilter)
  if (customers.length === 0) {
    return Response.json({ error: "No customers match this audience filter" }, { status: 400 })
  }

  // Create campaign record first
  const campaign = await prisma.campaign.create({
    data: {
      businessId: id,
      type: "marketing",
      name: name.trim(),
      messageTemplate: messageTemplate.trim(),
      audienceFilter: { filter: audienceFilter },
      status: "active",
    },
  })

  let sentCount = 0
  let failedCount = 0
  let skippedCount = 0

  for (const customer of customers) {
    const text = renderMessage(messageTemplate, customer.name, business.name)
    const outcome = await sendCampaignMessage(business, customer, text, campaign.id)
    if (outcome === "sent") sentCount++
    else if (outcome === "failed") failedCount++
    else skippedCount++
  }

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { sentCount },
  })

  return Response.json({ campaignId: campaign.id, sentCount, failedCount, skippedCount })
}
