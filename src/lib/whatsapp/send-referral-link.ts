import { prisma } from "@/lib/prisma"
import { sendTextMessage } from "@/lib/whatsapp/gupshup"
import { getOrCreateReferralCode, buildReferralLink } from "@/lib/referrals"

interface BusinessProfile {
  id: string
  name: string
  whatsappNumber: string | null
}

export async function sendReferralLinkToCustomer(
  business: BusinessProfile,
  customer: { id: string; name: string; phone: string },
): Promise<"sent" | "failed" | "skipped"> {
  const config = await prisma.whatsappConfig.findUnique({ where: { businessId: business.id } })
  if (!config?.isConnected || !business.whatsappNumber) return "skipped"

  const code = await getOrCreateReferralCode(customer.id)
  const link = buildReferralLink(code)

  const sourceDigits = business.whatsappNumber.replace(/\D/g, "")
  const sourceNumber = sourceDigits.length === 10 ? `91${sourceDigits}` : sourceDigits
  const text = `Hey ${customer.name}! Share your referral link with friends — you'll both earn loyalty points when they visit ${business.name}: ${link}`

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
    console.error(`Referral link send failed for customer ${customer.id}: ${result.error}`)
    return "failed"
  }
  return "sent"
}
