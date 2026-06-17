import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-session"

const PLAN_MRR: Record<string, number> = {
  starter: 999,
  growth:  2499,
  pro:     4999,
  trial:   0,
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try { await verifyAdminSession(token) } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  // Active subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: { status: "active" },
    select: { plan: true, createdAt: true },
  })

  const mrr = subscriptions.reduce((sum, s) => sum + (PLAN_MRR[s.plan.toLowerCase()] ?? 0), 0)
  const arr  = mrr * 12

  // Plan distribution
  const planDist = await prisma.business.groupBy({
    by: ["plan"],
    _count: { plan: true },
    where: { status: { not: "suspended" } },
  })

  // New businesses last 30 days
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const newThisMonth = await prisma.business.count({ where: { createdAt: { gte: since30 } } })

  // Failed / past_due invoices
  const failedInvoices = await prisma.invoice.findMany({
    where: { status: { in: ["failed", "past_due"] } },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      amount: true,
      status: true,
      createdAt: true,
      business: { select: { name: true, plan: true } },
    },
  })

  // Monthly revenue last 12 months
  const months = await prisma.$queryRaw<{ month: string; total: string }[]>`
    SELECT
      TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YY') AS month,
      SUM(amount)::text AS total
    FROM "Invoice"
    WHERE status = 'paid'
      AND "createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY DATE_TRUNC('month', "createdAt")
  `

  return NextResponse.json({
    mrr,
    arr,
    newThisMonth,
    planDist: planDist.map((p) => ({ plan: p.plan, count: p._count.plan })),
    failedInvoices,
    monthly: months.map((m) => ({ month: m.month, total: parseFloat(m.total ?? "0") })),
  })
}
