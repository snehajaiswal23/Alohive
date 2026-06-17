import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { getAnalytics } from "@/lib/analytics"
import { Topbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/ui/stat-card"
import { DashCard } from "@/components/ui/card"
import {
  RevenueChart,
  CampaignROIChart,
  PeakHoursHeatmap,
  StaffTable,
} from "@/components/dashboard/analytics-charts"
import { formatCurrency } from "@/lib/utils"
import { IndianRupee, Users, TrendingUp, RotateCcw, Target, Clock } from "lucide-react"

export default async function AnalyticsPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const payload = token ? await verifySession(token).catch(() => null) : null
  if (!payload) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { businessId: true },
  })
  if (!user) redirect("/login")

  const data = await getAnalytics(user.businessId)

  const revChange = data.revenueLastMonth > 0
    ? Math.round(((data.revenueMTD - data.revenueLastMonth) / data.revenueLastMonth) * 100)
    : null

  const activeRate = data.totalCustomers > 0
    ? Math.round((data.activeCustomers30d / data.totalCustomers) * 100)
    : 0

  const avgCampaignROI = data.campaignROI.length > 0
    ? Math.round(data.campaignROI.reduce((s, c) => s + c.roiPct, 0) / data.campaignROI.length)
    : null

  return (
    <div>
      <Topbar title="Analytics" subtitle="Revenue, retention, and performance — all from your real data" />
      <div className="p-6 space-y-6">

        {/* ── KPI stat cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            theme="light"
            title="Revenue MTD"
            value={formatCurrency(data.revenueMTD)}
            change={revChange != null ? `${revChange >= 0 ? "+" : ""}${revChange}% vs last mo` : undefined}
            changePositive={revChange != null ? revChange >= 0 : undefined}
            accentColor="green"
            icon={<IndianRupee size={16} />}
          />
          <StatCard
            theme="light"
            title="Last month"
            value={formatCurrency(data.revenueLastMonth)}
            accentColor="teal"
            icon={<IndianRupee size={16} />}
          />
          <StatCard
            theme="light"
            title="Avg CLV"
            value={data.clv > 0 ? formatCurrency(data.clv) : "—"}
            change="lifetime spend / customer"
            accentColor="blue"
            icon={<TrendingUp size={16} />}
          />
          <StatCard
            theme="light"
            title="Retention rate"
            value={`${data.retentionRate}%`}
            change="30-day repeat visitors"
            changePositive={data.retentionRate >= 50}
            accentColor="amber"
            icon={<RotateCcw size={16} />}
          />
          <StatCard
            theme="light"
            title="Active customers"
            value={`${data.activeCustomers30d} / ${data.totalCustomers}`}
            change={`${activeRate}% active in 30d`}
            changePositive={activeRate >= 30}
            accentColor="teal"
            icon={<Users size={16} />}
          />
          <StatCard
            theme="light"
            title="Avg campaign ROI"
            value={avgCampaignROI != null ? `${avgCampaignROI}%` : "—"}
            change={data.campaignROI.length > 0 ? `across ${data.campaignROI.length} campaign${data.campaignROI.length !== 1 ? "s" : ""}` : "no campaigns yet"}
            changePositive={avgCampaignROI != null ? avgCampaignROI >= 10 : undefined}
            accentColor="green"
            icon={<Target size={16} />}
          />
        </div>

        {/* ── Revenue trend ──────────────────────────────────────── */}
        <DashCard>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Revenue trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly revenue from logged visits (last 12 months)</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">This month</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(data.revenueMTD)}</p>
            </div>
          </div>
          <RevenueChart data={data.monthlyRevenue} />
        </DashCard>

        {/* ── Campaign ROI + Staff ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <DashCard>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Campaign ROI</h2>
              <p className="text-xs text-gray-400 mt-0.5">Messages sent vs customers recovered per campaign</p>
            </div>
            <CampaignROIChart data={data.campaignROI} />
            {data.campaignROI.length > 0 && (
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-gray-200 inline-block" />
                  Sent
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-growth-500 inline-block" />
                  Recovered ≥20%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-trust-500 inline-block" />
                  10–19%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
                  &lt;10%
                </span>
              </div>
            )}
          </DashCard>

          <DashCard>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Staff performance</h2>
            </div>
            <StaffTable data={data.staffPerformance} />
          </DashCard>

        </div>

        {/* ── Peak hours heatmap ─────────────────────────────────── */}
        <DashCard>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-gray-400" />
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Peak hours</h2>
              <p className="text-xs text-gray-400">Visit density by day and hour (last 90 days)</p>
            </div>
          </div>
          <PeakHoursHeatmap
            days={data.peakHours.days}
            hours={data.peakHours.hours}
            data={data.peakHours.data}
          />
        </DashCard>

        {/* ── CLV detail card ────────────────────────────────────── */}
        {data.clv > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DashCard className="bg-growth-50 border-growth-200">
              <p className="text-xs text-growth-700 font-semibold uppercase tracking-wide mb-1">Customer Lifetime Value</p>
              <p className="text-3xl font-bold text-growth-800">{formatCurrency(data.clv)}</p>
              <p className="text-xs text-growth-600 mt-1">Average total spend per customer across all visits</p>
            </DashCard>
            <DashCard className="bg-trust-50 border-trust-200">
              <p className="text-xs text-trust-700 font-semibold uppercase tracking-wide mb-1">30-day retention</p>
              <p className="text-3xl font-bold text-trust-800">{data.retentionRate}%</p>
              <p className="text-xs text-trust-600 mt-1">
                Customers who returned within 30 days of their previous visit
              </p>
            </DashCard>
            <DashCard className="bg-amber-50 border-amber-200">
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-1">Active base</p>
              <p className="text-3xl font-bold text-amber-800">{data.activeCustomers30d}</p>
              <p className="text-xs text-amber-600 mt-1">
                Customers who visited in the last 30 days out of {data.totalCustomers} total
              </p>
            </DashCard>
          </div>
        )}

      </div>
    </div>
  )
}
