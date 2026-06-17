import { prisma } from "@/lib/prisma"
import { sendTextMessage } from "@/lib/whatsapp/gupshup"

interface BusinessProfile {
  id: string
  name: string
  whatsappNumber: string | null
}

export async function sendCampaignMessage(
  business: BusinessProfile,
  customer: { id: string; name: string; phone: string },
  text: string,
  campaignId: string,
): Promise<"sent" | "failed" | "skipped"> {
  const config = await prisma.whatsappConfig.findUnique({ where: { businessId: business.id } })
  if (!config?.isConnected || !business.whatsappNumber) return "skipped"

  const sourceDigits = business.whatsappNumber.replace(/\D/g, "")
  const sourceNumber = sourceDigits.length === 10 ? `91${sourceDigits}` : sourceDigits

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
      campaignId,
      direction: "outbound",
      messageBody: text,
      status: result.ok ? "sent" : "failed",
      gupshupMessageId: result.ok ? result.data.messageId : null,
    },
  })

  if (!result.ok) {
    console.error(`Campaign message send failed for customer ${customer.id}: ${result.error}`)
    return "failed"
  }
  return "sent"
}
