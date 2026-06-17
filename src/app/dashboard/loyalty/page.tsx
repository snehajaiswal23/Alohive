import Link from "next/link"
import { cookies } from "next/headers"
import { Topbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/ui/stat-card"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoyaltyConfigForm } from "@/components/dashboard/loyalty-config-form"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { getLoyaltyConfig } from "@/lib/loyalty"
import { Gift, Users, TrendingUp, Star } from "lucide-react"

const TIER_ORDER = ["Bronze", "Silver", "Gold", "Platinum"] as const
const TIER_COLORS: Record<string, string> = {
  Bronze: "bg-amber-500",
  Silver: "bg-gray-400",
  Gold: "bg-amber-400",
  Platinum: "bg-blue-400",
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function pctChange(current: number, previous: number): { change: string; changePositive: boolean } | null {
  if (previous <= 0) return null
  const pct = Math.round(((current - previous) / previous) * 100)
  return { change: `${pct >= 0 ? "+" : ""}${pct}% vs last mo`, changePositive: pct >= 0 }
}

export default async function LoyaltyPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const payload = token ? await verifySession(token).catch(() => null) : null
  const user = payload ? await prisma.user.findUnique({ where: { id: payload.userId } }) : null

  const config = user ? await getLoyaltyConfig(user.businessId) : null

  let totalMembers = 0
  let tiers: { name: string; range: string; count: number; color: string; percent: number }[] = []
  let topCustomers: { id: string; name: string; points: number; tier: string; visits: number }[] = []
  let pointsIssued = 0
  let pointsRedeemed = 0
  let issuedChange: { change: string; changePositive: boolean } | null = null
  let redeemedChange: { change: string; changePositive: boolean } | null = null

  if (user && config) {
    const businessId = user.businessId
    const now = new Date()
    const thisMonthStart = startOfMonth(now)
    const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1))
    const thresholds = config.tierThresholds as unknown as { Silver: number; Gold: number; Platinum: number }

    const [tierCounts, customers, issuedThisMonth, redeemedThisMonth, issuedLastMonth, redeemedLastMonth] =
      await Promise.all([
        prisma.customer.groupBy({ by: ["loyaltyTier"], where: { businessId }, _count: { _all: true } }),
        prisma.customer.findMany({
          where: { businessId, loyaltyPoints: { gt: 0 } },
          orderBy: { loyaltyPoints: "desc" },
          take: 8,
        }),
        prisma.loyaltyTransaction.aggregate({
          where: { businessId, createdAt: { gte: thisMonthStart }, points: { gt: 0 } },
          _sum: { points: true },
        }),
        prisma.loyaltyTransaction.aggregate({
          where: { businessId, createdAt: { gte: thisMonthStart }, points: { lt: 0 } },
          _sum: { points: true },
        }),
        prisma.loyaltyTransaction.aggregate({
          where: { businessId, createdAt: { gte: lastMonthStart, lt: thisMonthStart }, points: { gt: 0 } },
          _sum: { points: true },
        }),
        prisma.loyaltyTransaction.aggregate({
          where: { businessId, createdAt: { gte: lastMonthStart, lt: thisMonthStart }, points: { lt: 0 } },
          _sum: { points: true },
        }),
      ])

    totalMembers = tierCounts.reduce((sum, t) => sum + t._count._all, 0)
    const countByTier = new Map(tierCounts.map((t) => [t.loyaltyTier, t._count._all]))

    const tierRanges: Record<string, string> = {
      Bronze: `0–${thresholds.Silver - 1} pts`,
      Silver: `${thresholds.Silver}–${thresholds.Gold - 1} pts`,
      Gold: `${thresholds.Gold}–${thresholds.Platinum - 1} pts`,
      Platinum: `${thresholds.Platinum}+ pts`,
    }

    tiers = TIER_ORDER.map((name) => {
      const count = countByTier.get(name) ?? 0
      return {
        name,
        range: tierRanges[name],
        count,
        color: TIER_COLORS[name],
        percent: totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0,
      }
    })

    topCustomers = customers.map((c) => ({
      id: c.id,
      name: c.name,
      points: c.loyaltyPoints,
      tier: c.loyaltyTier,
      visits: c.totalVisits,
    }))

    pointsIssued = issuedThisMonth._sum.points ?? 0
    pointsRedeemed = Math.abs(redeemedThisMonth._sum.points ?? 0)
    issuedChange = pctChange(pointsIssued, issuedLastMonth._sum.points ?? 0)
    redeemedChange = pctChange(pointsRedeemed, Math.abs(redeemedLastMonth._sum.points ?? 0))
  }

  const redemptionRate = pointsIssued > 0 ? Math.round((pointsRedeemed / pointsIssued) * 100) : 0

  return (
    <div>
      <Topbar title="Loyalty" subtitle="Manage your loyalty program and tiers" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard theme="light" title="Total members" value={totalMembers} accentColor="teal" icon={<Users size={16} />} />
          <StatCard
            theme="light"
            title="Points issued (mo)"
            value={pointsIssued.toLocaleString()}
            change={issuedChange?.change}
            changePositive={issuedChange?.changePositive}
            accentColor="green"
            icon={<Gift size={16} />}
          />
          <StatCard
            theme="light"
            title="Points redeemed (mo)"
            value={pointsRedeemed.toLocaleString()}
            change={redeemedChange?.change}
            changePositive={redeemedChange?.changePositive}
            accentColor="amber"
            icon={<Star size={16} />}
          />
          <StatCard theme="light" title="Redemption rate" value={`${redemptionRate}%`} accentColor="blue" icon={<TrendingUp size={16} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tier distribution */}
          <DashCard>
            <h2 className="text-sm font-semibold text-gray-800 mb-5">Tier distribution</h2>
            {totalMembers === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No customers yet</p>
            ) : (
              <div className="space-y-4">
                {tiers.map((tier) => (
                  <div key={tier.name}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-gray-700">{tier.name} <span className="text-gray-400 font-normal">({tier.range})</span></span>
                      <span className="font-medium text-gray-800">{tier.count} customers</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${tier.color} rounded-full`} style={{ width: `${tier.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashCard>

          {/* Config panel */}
          {user && config && (
            <LoyaltyConfigForm
              businessId={user.businessId}
              initialConfig={{
                pointsPerVisit: config.pointsPerVisit,
                pointsPerReview: config.pointsPerReview,
                pointsPerReferral: config.pointsPerReferral,
                tierThresholds: config.tierThresholds as unknown as { Silver: number; Gold: number; Platinum: number },
              }}
            />
          )}
        </div>

        {/* Top customers */}
        <DashCard>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Top loyal customers</h2>
          {topCustomers.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No customers earning points yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["#", "Customer", "Points", "Tier", "Visits"].map((h) => (
                    <th key={h} className="text-left pb-2 text-xs font-semibold text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="py-3 font-medium text-gray-800">
                      <Link href={`/dashboard/customers/${c.id}`} className="hover:text-clarity-600">{c.name}</Link>
                    </td>
                    <td className="py-3 font-medium text-clarity-700">{c.points.toLocaleString()}</td>
                    <td className="py-3">
                      <Badge color={c.tier === "Platinum" ? "blue" : "amber"} variant="subtle">{c.tier}</Badge>
                    </td>
                    <td className="py-3 text-gray-600">{c.visits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DashCard>
      </div>
    </div>
  )
}
