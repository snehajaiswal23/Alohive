import { cookies } from "next/headers"
import { Topbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/ui/stat-card"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FeedbackBreakdownChart } from "@/components/dashboard/feedback-breakdown-chart"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { getDashboardStats } from "@/lib/dashboard-stats"
import { BarChart2, Star, Gift, RotateCcw, AlertCircle } from "lucide-react"

const sentimentColor = { happy: "green", neutral: "amber", unhappy: "red" } as const

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

function visitsChange(today: number, yesterday: number) {
  if (yesterday === 0) return undefined
  const diff = today - yesterday
  const sign = diff >= 0 ? "+" : ""
  return { text: `${sign}${diff} vs yesterday`, positive: diff >= 0 }
}

export default async function DashboardHome() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const payload = token ? await verifySession(token).catch(() => null) : null
  const user = payload
    ? await prisma.user.findUnique({ where: { id: payload.userId }, include: { business: true } })
    : null

  const stats = user ? await getDashboardStats(user.businessId) : null
  const change = stats ? visitsChange(stats.visitsToday, stats.visitsYesterday) : undefined

  return (
    <div>
      <Topbar
        title={user ? `Good morning, ${user.name}` : "Dashboard"}
        subtitle={user?.business ? `${user.business.name}${user.business.locality ? ` · ${user.business.locality}` : ""}` : undefined}
      />
      <div className="p-6 space-y-6">

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            theme="light"
            title="Visits today"
            value={stats?.visitsToday ?? 0}
            change={change?.text}
            changePositive={change?.positive}
            accentColor="teal"
            icon={<BarChart2 size={16} />}
          />
          <StatCard
            theme="light"
            title="New Google reviews"
            value={stats?.newGoogleReviewsToday ?? 0}
            accentColor="blue"
            icon={<Star size={16} />}
          />
          <StatCard
            theme="light"
            title="Points awarded today"
            value={(stats?.pointsAwardedToday ?? 0).toLocaleString()}
            change={stats ? `${stats.customersAwardedToday} customers` : undefined}
            changePositive
            accentColor="green"
            icon={<Gift size={16} />}
          />
          <StatCard
            theme="light"
            title="Win-back sent"
            value={stats?.winbackSentToday ?? 0}
            accentColor="amber"
            icon={<RotateCcw size={16} />}
          />
        </div>

        {/* Alert banner */}
        {stats && stats.unhappyAlertsTotal > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-[12px] px-5 py-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-700">
                {stats.unhappyAlertsTotal} unhappy customer{stats.unhappyAlertsTotal > 1 ? "s" : ""} need{stats.unhappyAlertsTotal === 1 ? "s" : ""} attention
              </p>
              <p className="text-xs text-red-500 mt-0.5 truncate">
                {stats.unhappyAlerts.map((a) => a.title.replace("Unhappy customer: ", "")).join(", ")}
              </p>
            </div>
            <a href="/dashboard/reviews" className="text-xs font-medium text-red-600 hover:text-red-700 shrink-0">View →</a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's feedback */}
          <DashCard>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Today&apos;s feedback</h2>
            <FeedbackBreakdownChart
              happy={stats?.feedbackBreakdown.happy ?? 0}
              neutral={stats?.feedbackBreakdown.neutral ?? 0}
              unhappy={stats?.feedbackBreakdown.unhappy ?? 0}
            />
          </DashCard>

          {/* Unhappy customer alerts */}
          <DashCard>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Unhappy customer alerts</h2>
            {!stats || stats.unhappyAlerts.length === 0 ? (
              <p className="text-sm text-gray-400">No unhappy customers right now.</p>
            ) : (
              <div className="space-y-3">
                {stats.unhappyAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 bg-red-50/60 border border-red-100 rounded-lg px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-red-700">{alert.title}</p>
                      <p className="text-xs text-red-500 mt-0.5 line-clamp-2">{alert.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{timeAgo(alert.createdAt)}</span>
                  </div>
                ))}
                {stats.unhappyAlertsTotal > stats.unhappyAlerts.length && (
                  <a href="/dashboard/reviews" className="text-xs font-medium text-clarity-600 hover:text-clarity-700">
                    +{stats.unhappyAlertsTotal - stats.unhappyAlerts.length} more →
                  </a>
                )}
              </div>
            )}
          </DashCard>
        </div>

        {/* Recent activity */}
        <DashCard>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Recent activity</h2>
          {!stats || stats.recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400">No visits yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                      {item.customerName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.customerName}</p>
                      <p className="text-xs text-gray-400">{item.service ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{timeAgo(item.visitedAt)}</span>
                    {item.sentiment && (
                      <Badge color={sentimentColor[item.sentiment as keyof typeof sentimentColor]} variant="subtle">
                        {item.sentiment}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashCard>
      </div>
    </div>
  )
}
