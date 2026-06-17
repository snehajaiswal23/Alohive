import { prisma } from "@/lib/prisma"

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export async function getDashboardStats(businessId: string) {
  const todayStart = startOfDay(new Date())
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  const [
    visitsToday,
    visitsYesterday,
    newGoogleReviewsToday,
    pointsToday,
    winbackSentToday,
    todaysFeedback,
    unhappyAlerts,
    unhappyAlertsTotal,
    recentVisits,
  ] = await Promise.all([
    prisma.visit.count({ where: { businessId, visitedAt: { gte: todayStart } } }),
    prisma.visit.count({ where: { businessId, visitedAt: { gte: yesterdayStart, lt: todayStart } } }),
    prisma.googleReview.count({ where: { businessId, createdAt: { gte: todayStart } } }),
    prisma.loyaltyTransaction.aggregate({
      where: { businessId, createdAt: { gte: todayStart } },
      _sum: { points: true },
      _count: { customerId: true },
    }),
    prisma.whatsappMessage.count({
      where: { businessId, createdAt: { gte: todayStart }, templateName: { contains: "winback" } },
    }),
    prisma.feedback.findMany({
      where: { businessId, createdAt: { gte: todayStart } },
      select: { score: true },
    }),
    prisma.notification.findMany({
      where: { businessId, type: "negative_feedback", read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.notification.count({ where: { businessId, type: "negative_feedback", read: false } }),
    prisma.visit.findMany({
      where: { businessId },
      orderBy: { visitedAt: "desc" },
      take: 8,
      include: { customer: true, feedback: true },
    }),
  ])

  const feedbackBreakdown = todaysFeedback.reduce(
    (acc, f) => {
      if (f.score >= 4) acc.happy++
      else if (f.score === 3) acc.neutral++
      else acc.unhappy++
      return acc
    },
    { happy: 0, neutral: 0, unhappy: 0 },
  )

  return {
    visitsToday,
    visitsYesterday,
    newGoogleReviewsToday,
    pointsAwardedToday: pointsToday._sum.points ?? 0,
    customersAwardedToday: pointsToday._count.customerId,
    winbackSentToday,
    feedbackBreakdown,
    unhappyAlerts: unhappyAlerts.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      createdAt: n.createdAt.toISOString(),
    })),
    unhappyAlertsTotal,
    recentActivity: recentVisits.map((v) => ({
      id: v.id,
      customerName: v.customer.name,
      service: v.service,
      visitedAt: v.visitedAt.toISOString(),
      sentiment: v.feedback ? (v.feedback.score >= 4 ? "happy" : v.feedback.score === 3 ? "neutral" : "unhappy") : null,
      score: v.feedback?.score ?? null,
    })),
  }
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>
