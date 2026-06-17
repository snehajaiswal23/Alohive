import { prisma } from "@/lib/prisma"
import { sendCampaignMessage } from "@/lib/whatsapp/send-campaign-message"

export class CampaignError extends Error {}

const VALID_TRIGGER_DAYS = [30, 60, 90]

export async function createWinbackCampaign(
  businessId: string,
  input: { name: string; triggerDays: number; messageTemplate: string; offer?: string },
) {
  if (!input.name?.trim()) throw new CampaignError("Campaign name is required")
  if (!VALID_TRIGGER_DAYS.includes(input.triggerDays)) {
    throw new CampaignError("Trigger must be 30, 60, or 90 days inactive")
  }
  if (!input.messageTemplate?.trim()) throw new CampaignError("Message template is required")

  return prisma.campaign.create({
    data: {
      businessId,
      type: "winback",
      name: input.name.trim(),
      triggerDays: input.triggerDays,
      messageTemplate: input.messageTemplate.trim(),
      offer: input.offer?.trim() || null,
      status: "active",
    },
  })
}

export async function listWinbackCampaigns(businessId: string) {
  return prisma.campaign.findMany({
    where: { businessId, type: "winback" },
    orderBy: { createdAt: "desc" },
  })
}

export async function setCampaignStatus(businessId: string, campaignId: string, status: "active" | "paused") {
  const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, businessId } })
  if (!campaign) throw new CampaignError("Campaign not found")
  return prisma.campaign.update({ where: { id: campaignId }, data: { status } })
}

const RECOVERY_WINDOW_MS = 14 * 24 * 60 * 60 * 1000

export async function getCampaignStats(businessId: string, campaignId: string) {
  const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, businessId } })
  if (!campaign) throw new CampaignError("Campaign not found")

  const messages = await prisma.whatsappMessage.findMany({
    where: { campaignId, direction: "outbound" },
    select: { customerId: true, status: true, createdAt: true, readAt: true, repliedAt: true },
  })

  const sent = messages.filter((m) => m.status === "sent" || m.status === "delivered" || m.status === "read")
  const failedCount = messages.filter((m) => m.status === "failed").length
  const openCount = sent.filter((m) => m.readAt != null).length
  const replyCount = sent.filter((m) => m.repliedAt != null).length

  const customerIds = [...new Set(sent.map((m) => m.customerId).filter((id): id is string => id != null))]
  const visits = customerIds.length
    ? await prisma.visit.findMany({
        where: { businessId, customerId: { in: customerIds } },
        select: { customerId: true, visitedAt: true, billAmount: true },
      })
    : []
  const visitsByCustomer = new Map<string, typeof visits>()
  for (const v of visits) {
    const arr = visitsByCustomer.get(v.customerId) ?? []
    arr.push(v)
    visitsByCustomer.set(v.customerId, arr)
  }

  let recoveredCount = 0
  let revenueRecovered = 0
  let revenueSampleSize = 0

  for (const m of sent) {
    if (!m.customerId) continue
    const windowEnd = new Date(m.createdAt.getTime() + RECOVERY_WINDOW_MS)
    const matchingVisits = (visitsByCustomer.get(m.customerId) ?? []).filter(
      (v) => v.visitedAt > m.createdAt && v.visitedAt <= windowEnd,
    )
    if (matchingVisits.length === 0) continue

    recoveredCount++
    for (const v of matchingVisits) {
      if (v.billAmount != null) {
        revenueRecovered += v.billAmount
        revenueSampleSize++
      }
    }
  }

  const sentCount = sent.length
  return {
    sentCount,
    failedCount,
    openCount,
    openRate: sentCount > 0 ? openCount / sentCount : null,
    replyCount,
    replyRate: sentCount > 0 ? replyCount / sentCount : null,
    recoveredCount,
    recoveredRate: sentCount > 0 ? recoveredCount / sentCount : null,
    revenueRecovered: revenueSampleSize > 0 ? revenueRecovered : null,
    revenueSampleSize,
  }
}

function renderTemplate(template: string, offer: string | null, customerName: string, businessName: string) {
  return template
    .replaceAll("{{name}}", customerName)
    .replaceAll("{{business}}", businessName)
    .replaceAll("{{offer}}", offer ?? "")
}

export async function runWinbackCampaignsForBusiness(businessId: string) {
  const [campaigns, business, config] = await Promise.all([
    prisma.campaign.findMany({ where: { businessId, type: "winback", status: "active" } }),
    prisma.business.findUnique({ where: { id: businessId } }),
    prisma.whatsappConfig.findUnique({ where: { businessId } }),
  ])

  if (campaigns.length === 0 || !business) return { sent: 0, failed: 0 }
  if (!config?.isConnected || !business.whatsappNumber) return { sent: 0, failed: 0 }

  const campaignByTrigger = new Map(
    campaigns.filter((c) => c.triggerDays != null).map((c) => [c.triggerDays as number, c]),
  )
  if (campaignByTrigger.size === 0) return { sent: 0, failed: 0 }

  const targets = await prisma.winBackTarget.findMany({
    where: { businessId, bucket: { in: [...campaignByTrigger.keys()] } },
    include: { customer: true },
  })

  let sent = 0
  let failed = 0

  for (const target of targets) {
    if (target.lastCampaignBucket === target.bucket) continue
    const campaign = campaignByTrigger.get(target.bucket)
    if (!campaign) continue

    const text = renderTemplate(campaign.messageTemplate, campaign.offer, target.customer.name, business.name)
    const outcome = await sendCampaignMessage(business, target.customer, text, campaign.id)

    await prisma.winBackTarget.update({
      where: { id: target.id },
      data: {
        lastCampaignBucket: target.bucket,
        contactedAt: outcome === "sent" ? new Date() : target.contactedAt,
      },
    })

    if (outcome === "sent") {
      await prisma.campaign.update({ where: { id: campaign.id }, data: { sentCount: { increment: 1 } } })
      sent++
    } else if (outcome === "failed") {
      failed++
    }
  }

  return { sent, failed }
}
