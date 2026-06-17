import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPostVisitFeedback } from "@/lib/whatsapp/send-feedback"

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - 30 * 60 * 1000)
  const dueVisits = await prisma.visit.findMany({
    where: { whatsappSent: false, visitedAt: { lte: cutoff } },
    include: { customer: true },
    take: 50,
  })

  let sent = 0
  let failed = 0
  let skipped = 0

  for (const visit of dueVisits) {
    let outcome: "sent" | "failed" | "skipped"
    try {
      outcome = await sendPostVisitFeedback(visit.businessId, visit.customer)
    } catch (e) {
      console.error(`Post-visit feedback send threw for visit ${visit.id}:`, e)
      outcome = "failed"
    }

    if (outcome === "sent") {
      sent++
      await prisma.visit.update({ where: { id: visit.id }, data: { whatsappSent: true } })
    } else if (outcome === "skipped") {
      skipped++
      // Business has no WA config — mark processed so we don't retry on every cron tick
      await prisma.visit.update({ where: { id: visit.id }, data: { whatsappSent: true } })
    } else {
      failed++
      // Leave whatsappSent: false so the cron retries on the next run
    }
  }

  return NextResponse.json({ processed: dueVisits.length, sent, failed, skipped })
}
