import { prisma } from "@/lib/prisma"

export interface MonthlyRevenue {
  month: string
  revenue: number
  visits: number
}

export interface CampaignROI {
  name: string
  type: string
  sentCount: number
  recoveredCount: number
  roiPct: number
}

export interface StaffPerformance {
  name: string
  role: string
  visits: number
  revenue: number
  avgRating: number | null
}

export interface AnalyticsSummary {
  revenueMTD: number
  revenueLastMonth: number
  clv: number
  retentionRate: number
  totalCustomers: number
  activeCustomers30d: number
  monthlyRevenue: MonthlyRevenue[]
  campaignROI: CampaignROI[]
  staffPerformance: StaffPerformance[]
  peakHours: {
    days: string[]
    hours: number[]
    data: number[][]
  }
}

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const HOURS = [9,10,11,12,13,14,15,16,17,18,19,20]
const DOW_TO_MON_SUN = [1,2,3,4,5,6,0] // Sun=0 in pg DOW; remap to Mon–Sun order

export async function getAnalytics(businessId: string): Promise<AnalyticsSummary> {
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    revMTD,
    revLastMo,
    clvRows,
    retentionRows,
    totalCustomers,
    activeCustomers30d,
    monthlyRaw,
    campaigns,
    staffRaw,
    peakRaw,
  ] = await Promise.all([
    prisma.visit.aggregate({
      where: { businessId, visitedAt: { gte: startOfThisMonth }, billAmount: { not: null } },
      _sum: { billAmount: true },
    }),
    prisma.visit.aggregate({
      where: { businessId, visitedAt: { gte: startOfLastMonth, lt: startOfThisMonth }, billAmount: { not: null } },
      _sum: { billAmount: true },
    }),
    // Average total spend per customer = CLV
    prisma.$queryRaw<{ clv: string | null }[]>`
      SELECT AVG(customer_total)::text AS clv
      FROM (
        SELECT SUM("billAmount") AS customer_total
        FROM "Visit"
        WHERE "businessId" = ${businessId} AND "billAmount" IS NOT NULL
        GROUP BY "customerId"
      ) sub
    `,
    // Retention: % of last-30d visitors who also visited before that window
    prisma.$queryRaw<{ total_recent: string; returning_count: string }[]>`
      WITH recent AS (
        SELECT DISTINCT "customerId"
        FROM "Visit"
        WHERE "businessId" = ${businessId} AND "visitedAt" >= ${thirtyDaysAgo}
      ),
      returning AS (
        SELECT r."customerId"
        FROM recent r
        WHERE EXISTS (
          SELECT 1 FROM "Visit" v
          WHERE v."customerId" = r."customerId"
            AND v."businessId" = ${businessId}
            AND v."visitedAt" < ${thirtyDaysAgo}
        )
      )
      SELECT
        COUNT(r."customerId")::text AS total_recent,
        COUNT(ret."customerId")::text AS returning_count
      FROM recent r
      LEFT JOIN returning ret ON ret."customerId" = r."customerId"
    `,
    prisma.customer.count({ where: { businessId } }),
    prisma.customer.count({ where: { businessId, lastVisitAt: { gte: thirtyDaysAgo } } }),
    // Monthly revenue + visit counts (12 months)
    prisma.$queryRaw<{ month: Date; revenue: string; visits: string }[]>`
      SELECT
        DATE_TRUNC('month', "visitedAt") AS month,
        COALESCE(SUM("billAmount"), 0)::text AS revenue,
        COUNT(*)::text AS visits
      FROM "Visit"
      WHERE "businessId" = ${businessId}
        AND "visitedAt" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "visitedAt")
      ORDER BY month ASC
    `,
    prisma.campaign.findMany({
      where: { businessId, sentCount: { gt: 0 } },
      select: { name: true, type: true, sentCount: true, recoveredCount: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    // Staff: visits + revenue + avg feedback score
    prisma.$queryRaw<{ name: string; role_label: string; visits: string; revenue: string | null; avg_rating: string | null }[]>`
      SELECT
        s.name,
        s."roleLabel" AS role_label,
        COUNT(v.id)::text AS visits,
        SUM(v."billAmount")::text AS revenue,
        AVG(f.score)::text AS avg_rating
      FROM "Staff" s
      LEFT JOIN "Visit" v ON v."staffId" = s.id
      LEFT JOIN "Feedback" f ON f."visitId" = v.id
      WHERE s."businessId" = ${businessId}
      GROUP BY s.id, s.name, s."roleLabel"
      ORDER BY COUNT(v.id) DESC
    `,
    // Peak hours heatmap — last 90 days
    prisma.$queryRaw<{ dow: string; hour: string; cnt: string }[]>`
      SELECT
        EXTRACT(DOW FROM "visitedAt")::text AS dow,
        EXTRACT(HOUR FROM "visitedAt")::text AS hour,
        COUNT(*)::text AS cnt
      FROM "Visit"
      WHERE "businessId" = ${businessId}
        AND "visitedAt" >= NOW() - INTERVAL '90 days'
      GROUP BY EXTRACT(DOW FROM "visitedAt"), EXTRACT(HOUR FROM "visitedAt")
    `,
  ])

  // ── Monthly revenue ──────────────────────────────────────────────
  const monthlyRevenue: MonthlyRevenue[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const match = monthlyRaw.find((r) => {
      const rm = new Date(r.month)
      return rm.getFullYear() === d.getFullYear() && rm.getMonth() === d.getMonth()
    })
    monthlyRevenue.push({
      month: `${MONTH_LABELS[d.getMonth()]} '${d.getFullYear().toString().slice(2)}`,
      revenue: match ? Math.round(parseFloat(match.revenue)) : 0,
      visits: match ? parseInt(match.visits) : 0,
    })
  }

  // ── Campaign ROI ─────────────────────────────────────────────────
  const campaignROI: CampaignROI[] = campaigns.map((c) => ({
    name: c.name.length > 22 ? c.name.slice(0, 22) + "…" : c.name,
    type: c.type,
    sentCount: c.sentCount,
    recoveredCount: c.recoveredCount,
    roiPct: c.sentCount > 0 ? Math.round((c.recoveredCount / c.sentCount) * 100) : 0,
  }))

  // ── Staff performance ────────────────────────────────────────────
  const staffPerformance: StaffPerformance[] = staffRaw.map((s) => ({
    name: s.name,
    role: s.role_label,
    visits: parseInt(s.visits),
    revenue: s.revenue ? Math.round(parseFloat(s.revenue)) : 0,
    avgRating: s.avg_rating ? Math.round(parseFloat(s.avg_rating) * 10) / 10 : null,
  }))

  // ── Peak hours heatmap ───────────────────────────────────────────
  const countMap = new Map<string, number>()
  for (const r of peakRaw) {
    countMap.set(`${r.dow}-${r.hour}`, parseInt(r.cnt))
  }
  const maxCount = Math.max(1, ...Array.from(countMap.values()))
  const heatData: number[][] = DOW_TO_MON_SUN.map((dow) =>
    HOURS.map((h) => {
      const cnt = countMap.get(`${dow}-${h}`) ?? 0
      return Math.round((cnt / maxCount) * 5)
    })
  )

  // ── Derived scalars ──────────────────────────────────────────────
  const totalRecent = parseInt(retentionRows[0]?.total_recent ?? "0")
  const returningCount = parseInt(retentionRows[0]?.returning_count ?? "0")
  const retentionRate = totalRecent > 0 ? Math.round((returningCount / totalRecent) * 100) : 0

  return {
    revenueMTD: Math.round(Number(revMTD._sum.billAmount ?? 0)),
    revenueLastMonth: Math.round(Number(revLastMo._sum.billAmount ?? 0)),
    clv: clvRows[0]?.clv ? Math.round(parseFloat(clvRows[0].clv)) : 0,
    retentionRate,
    totalCustomers,
    activeCustomers30d,
    monthlyRevenue,
    campaignROI,
    staffPerformance,
    peakHours: {
      days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
      hours: HOURS,
      data: heatData,
    },
  }
}
