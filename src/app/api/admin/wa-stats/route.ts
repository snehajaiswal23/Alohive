import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-session"

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try { await verifyAdminSession(token) } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalSent, delivered, read, replied, failed] = await Promise.all([
    prisma.whatsappMessage.count({ where: { direction: "outbound", createdAt: { gte: since30 } } }),
    prisma.whatsappMessage.count({ where: { direction: "outbound", status: "delivered", createdAt: { gte: since30 } } }),
    prisma.whatsappMessage.count({ where: { direction: "outbound", readAt: { not: null }, createdAt: { gte: since30 } } }),
    prisma.whatsappMessage.count({ where: { direction: "outbound", repliedAt: { not: null }, createdAt: { gte: since30 } } }),
    prisma.whatsappMessage.count({ where: { direction: "outbound", status: "failed", createdAt: { gte: since30 } } }),
  ])

  // Daily send volume last 14 days
  const daily = await prisma.$queryRaw<{ day: string; count: string }[]>`
    SELECT
      TO_CHAR(DATE_TRUNC('day', "createdAt"), 'DD Mon') AS day,
      COUNT(*)::text AS count
    FROM "WhatsappMessage"
    WHERE direction = 'outbound'
      AND "createdAt" >= NOW() - INTERVAL '14 days'
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY DATE_TRUNC('day', "createdAt")
  `

  // Top template usage
  const topTemplates = await prisma.whatsappMessage.groupBy({
    by: ["templateName"],
    where: { templateName: { not: null }, createdAt: { gte: since30 } },
    _count: { templateName: true },
    orderBy: { _count: { templateName: "desc" } },
    take: 5,
  })

  const deliveryRate = totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0
  const readRate     = delivered > 0 ? Math.round((read / delivered) * 100) : 0
  const replyRate    = read > 0 ? Math.round((replied / read) * 100) : 0

  return NextResponse.json({
    totalSent, delivered, read, replied, failed,
    deliveryRate, readRate, replyRate,
    daily: daily.map((d) => ({ day: d.day, count: parseInt(d.count) })),
    topTemplates: topTemplates.map((t) => ({ name: t.templateName, count: t._count.templateName })),
  })
}
