import { cookies } from "next/headers"
import { Topbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/ui/stat-card"
import { WinbackCampaignManager } from "@/components/dashboard/winback-campaign-manager"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { listWinbackCampaigns } from "@/lib/campaigns"
import { RotateCcw, Users } from "lucide-react"

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export default async function WinbackPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const payload = token ? await verifySession(token).catch(() => null) : null
  const user = payload ? await prisma.user.findUnique({ where: { id: payload.userId } }) : null

  let inactive30 = 0
  let inactive60 = 0
  let inactive90 = 0
  let recoveredThisMonth = 0
  let recoveredLastMonth = 0
  let campaigns: Awaited<ReturnType<typeof listWinbackCampaigns>> = []

  if (user) {
    const businessId = user.businessId
    const now = new Date()
    const thisMonthStart = startOfMonth(now)
    const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1))

    const [bucketCounts, recoveredThisMonthCount, recoveredLastMonthCount, campaignList] = await Promise.all([
      prisma.winBackTarget.groupBy({ by: ["bucket"], where: { businessId }, _count: { _all: true } }),
      prisma.notification.count({
        where: { businessId, type: "winback_recovered", createdAt: { gte: thisMonthStart } },
      }),
      prisma.notification.count({
        where: { businessId, type: "winback_recovered", createdAt: { gte: lastMonthStart, lt: thisMonthStart } },
      }),
      listWinbackCampaigns(businessId),
    ])

    const countByBucket = new Map(bucketCounts.map((b) => [b.bucket, b._count._all]))
    inactive30 = countByBucket.get(30) ?? 0
    inactive60 = countByBucket.get(60) ?? 0
    inactive90 = countByBucket.get(90) ?? 0
    recoveredThisMonth = recoveredThisMonthCount
    recoveredLastMonth = recoveredLastMonthCount
    campaigns = campaignList
  }

  const recoveredChange =
    recoveredLastMonth > 0
      ? `${recoveredThisMonth - recoveredLastMonth >= 0 ? "+" : ""}${recoveredThisMonth - recoveredLastMonth} vs last mo`
      : undefined

  return (
    <div>
      <Topbar title="Win-back Campaigns" subtitle="Re-engage inactive customers automatically" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard theme="light" title="Inactive 30d" value={inactive30} accentColor="amber" icon={<Users size={16} />} />
          <StatCard theme="light" title="Inactive 60d" value={inactive60} accentColor="red" icon={<Users size={16} />} />
          <StatCard theme="light" title="Inactive 90d" value={inactive90} accentColor="red" icon={<Users size={16} />} />
          <StatCard
            theme="light"
            title="Recovered this month"
            value={recoveredThisMonth}
            change={recoveredChange}
            changePositive={recoveredChange ? recoveredThisMonth >= recoveredLastMonth : undefined}
            accentColor="green"
            icon={<RotateCcw size={16} />}
          />
        </div>

        {user && (
          <WinbackCampaignManager
            businessId={user.businessId}
            initialCampaigns={campaigns.map((c) => ({
              id: c.id,
              name: c.name,
              triggerDays: c.triggerDays,
              status: c.status,
              sentCount: c.sentCount,
              replyCount: c.replyCount,
              recoveredCount: c.recoveredCount,
            }))}
          />
        )}
      </div>
    </div>
  )
}
