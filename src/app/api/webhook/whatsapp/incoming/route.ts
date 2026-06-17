import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { normalizePhone } from "@/lib/phone"
import { sendReviewLinkToCustomer, alertOwnerOfNegativeFeedback } from "@/lib/whatsapp/send-review-link"

interface ParsedIncoming {
  phone: string
  text: string
}

function parseIncoming(body: any): ParsedIncoming | null {
  const payload = body?.payload
  if (body?.type !== "message" || !payload) return null

  const sourcePhone = payload.sender?.phone || payload.source
  const text =
    payload.type === "text"
      ? payload.payload?.text
      : payload.payload?.title || payload.payload?.id

  if (!sourcePhone || !text) return null
  return { phone: normalizePhone(String(sourcePhone)), text: String(text).trim() }
}

function classifyFeedback(text: string): { score: number; sentiment: "happy" | "unhappy" } | null {
  // Only treat the message as feedback if the ENTIRE body is a single digit 1-5.
  // This prevents "call me at 3pm" or "thanks 4 the service!" from being misclassified.
  const match = /^\s*([1-5])\s*$/.exec(text)
  if (!match) return null
  const score = Number(match[1])
  return { score, sentiment: score >= 4 ? "happy" : "unhappy" }
}

async function markCampaignReply(phone: string) {
  const lastCampaignMessage = await prisma.whatsappMessage.findFirst({
    where: {
      direction: "outbound",
      status: { in: ["sent", "delivered", "read"] },
      campaignId: { not: null },
      repliedAt: null,
      customer: { phone },
    },
    orderBy: { createdAt: "desc" },
  })
  if (!lastCampaignMessage) return

  await prisma.whatsappMessage.update({
    where: { id: lastCampaignMessage.id },
    data: { repliedAt: new Date() },
  })
  await prisma.campaign.update({
    where: { id: lastCampaignMessage.campaignId! },
    data: { replyCount: { increment: 1 } },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const incoming = parseIncoming(body)
  if (!incoming) return Response.json({ received: true })

  await markCampaignReply(incoming.phone)

  const visit = await prisma.visit.findFirst({
    where: {
      whatsappSent: true,
      feedbackReceived: false,
      customer: { phone: incoming.phone },
    },
    orderBy: { visitedAt: "desc" },
    include: { customer: true, business: true },
  })

  if (!visit) return Response.json({ received: true, matched: false })

  await prisma.whatsappMessage.create({
    data: {
      businessId: visit.businessId,
      customerId: visit.customerId,
      direction: "inbound",
      messageBody: incoming.text,
      status: "received",
    },
  })

  const classification = classifyFeedback(incoming.text)
  if (!classification) return Response.json({ received: true, matched: true, classified: false })

  await prisma.$transaction([
    prisma.feedback.create({
      data: {
        visitId: visit.id,
        customerId: visit.customerId,
        businessId: visit.businessId,
        score: classification.score,
        sentiment: classification.sentiment,
        message: incoming.text,
      },
    }),
    prisma.visit.update({ where: { id: visit.id }, data: { feedbackReceived: true } }),
  ])

  const avgResult = await prisma.feedback.aggregate({
    where: { customerId: visit.customerId },
    _avg: { score: true },
  })
  await prisma.customer.update({
    where: { id: visit.customerId },
    data: { feedbackAvg: avgResult._avg.score ?? 0 },
  })

  if (classification.sentiment === "happy") {
    await sendReviewLinkToCustomer(visit.business, visit.customer)
  } else {
    await alertOwnerOfNegativeFeedback(visit.businessId, visit.customer, {
      score: classification.score,
      message: incoming.text,
    })
  }

  return Response.json({
    received: true,
    matched: true,
    classified: true,
    sentiment: classification.sentiment,
  })
}

export async function GET(req: NextRequest) {
  // Gupshup webhook verification
  const { searchParams } = new URL(req.url)
  const challenge = searchParams.get("hub.challenge")
  if (challenge) return new Response(challenge)
  return Response.json({ status: "ok" })
}
