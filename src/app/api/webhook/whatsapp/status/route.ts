import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const gupshupMessageId = body?.payload?.id ?? body?.messageId
  const status = body?.payload?.type ?? body?.status
  if (!gupshupMessageId || !status) return Response.json({ received: true })

  const message = await prisma.whatsappMessage.findFirst({ where: { gupshupMessageId } })
  if (!message) return Response.json({ received: true, matched: false })

  if (status === "read" && !message.readAt) {
    await prisma.whatsappMessage.update({
      where: { id: message.id },
      data: { readAt: new Date(), status: "read" },
    })
    if (message.campaignId) {
      await prisma.campaign.update({
        where: { id: message.campaignId },
        data: { openCount: { increment: 1 } },
      })
    }
  } else if (["sent", "delivered", "failed"].includes(status) && message.status !== "read") {
    await prisma.whatsappMessage.update({ where: { id: message.id }, data: { status } })
  }

  return Response.json({ received: true, matched: true })
}
