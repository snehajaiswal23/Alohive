import { prisma } from "@/lib/prisma"
import { sendTemplateMessage } from "@/lib/whatsapp/gupshup"

export async function sendPostVisitFeedback(
  businessId: string,
  customer: { id: string; name: string; phone: string },
): Promise<"sent" | "failed" | "skipped"> {
  const [config, template, business] = await Promise.all([
    prisma.whatsappConfig.findUnique({ where: { businessId } }),
    prisma.whatsappTemplate.findUnique({
      where: { businessId_name: { businessId, name: "post_visit_feedback" } },
    }),
    prisma.business.findUnique({ where: { id: businessId } }),
  ])

  if (!config?.isConnected || !business?.whatsappNumber) return "skipped"
  if (!template || template.status !== "approved" || !template.gupshupTemplateId) return "skipped"

  const sourceDigits = business.whatsappNumber.replace(/\D/g, "")
  const sourceNumber = sourceDigits.length === 10 ? `91${sourceDigits}` : sourceDigits

  const result = await sendTemplateMessage({
    apiKey: config.apiKey,
    sourceNumber,
    appName: config.appName,
    destination: `91${customer.phone}`,
    templateId: template.gupshupTemplateId,
    params: [customer.name, business.name],
  })

  await prisma.whatsappMessage.create({
    data: {
      businessId,
      customerId: customer.id,
      direction: "outbound",
      templateName: template.name,
      messageBody: template.body,
      status: result.ok ? "sent" : "failed",
      gupshupMessageId: result.ok ? result.data.messageId : null,
    },
  })

  if (!result.ok) {
    console.error(`WhatsApp send failed for customer ${customer.id}: ${result.error}`)
    return "failed"
  }
  return "sent"
}
