import { prisma } from "@/lib/prisma"
import { sendTextMessage } from "@/lib/whatsapp/gupshup"
import { getOrCreateReviewLink } from "@/lib/google/review-link"

interface BusinessProfile {
  id: string
  name: string
  city: string
  locality: string | null
  whatsappNumber: string | null
  googlePlaceId: string | null
  googleReviewLink: string | null
}

export async function sendReviewLinkToCustomer(
  business: BusinessProfile,
  customer: { id: string; name: string; phone: string },
): Promise<"sent" | "failed" | "skipped"> {
  const config = await prisma.whatsappConfig.findUnique({ where: { businessId: business.id } })
  if (!config?.isConnected || !business.whatsappNumber) return "skipped"

  const reviewLink = await getOrCreateReviewLink(business)
  if (!reviewLink) return "skipped"

  const sourceDigits = business.whatsappNumber.replace(/\D/g, "")
  const sourceNumber = sourceDigits.length === 10 ? `91${sourceDigits}` : sourceDigits
  const text = `So glad you had a great time, ${customer.name}! Would you mind sharing it on Google? ${reviewLink}`

  const result = await sendTextMessage({
    apiKey: config.apiKey,
    sourceNumber,
    appName: config.appName,
    destination: `91${customer.phone}`,
    text,
  })

  await prisma.whatsappMessage.create({
    data: {
      businessId: business.id,
      customerId: customer.id,
      direction: "outbound",
      messageBody: text,
      status: result.ok ? "sent" : "failed",
      gupshupMessageId: result.ok ? result.data.messageId : null,
    },
  })

  if (!result.ok) {
    console.error(`Review link send failed for customer ${customer.id}: ${result.error}`)
    return "failed"
  }
  return "sent"
}

export async function alertOwnerOfNegativeFeedback(
  businessId: string,
  customer: { name: string; phone: string },
  feedback: { score: number; message: string | null },
) {
  const owner = await prisma.user.findFirst({ where: { businessId, role: "owner" } })

  await prisma.notification.create({
    data: {
      businessId,
      userId: owner?.id ?? null,
      type: "negative_feedback",
      title: `Unhappy customer: ${customer.name}`,
      message: `${customer.name} (${customer.phone}) rated their visit ${feedback.score}/5.${
        feedback.message ? ` Their note: "${feedback.message}"` : ""
      }`,
    },
  })
}
