import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, IndianRupee, TrendingDown, MessageCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"

const PLAN_MRR: Record<string, number> = { starter: 999, growth: 2499, pro: 4999, trial: 0 }

async function getData() {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const since60 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

  const [
    totalBusinesses,
    newThisMonth,
    activeSubs,
    waStats,
    planDist,
    cityDist,
    newLast30,
    newPrev30,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { createdAt: { gte: since30 } } }),
    prisma.subscription.findMany({ where: { status: "active" }, select: { plan: true } }),
    prisma.whatsappMessage.aggregate({
      where: { direction: "outbound", createdAt: { gte: since30 } },
      _count: { id: true },
    }),
    prisma.business.groupBy({ by: ["plan"], _count: { plan: true } }),
    prisma.business.groupBy({ by: ["city"], _count: { city: true }, orderBy: { _count: { city: "desc" } }, take: 6 }),
    prisma.business.count({ where: { createdAt: { gte: since30 } } }),
    prisma.business.count({ where: { createdAt: { gte: since60, lt: since30 } } }),
  ])

  const mrr = activeSubs.reduce((s, sub) => s + (PLAN_MRR[sub.plan.toLowerCase()] ?? 0), 0)

  // Approximate churn: businesses lost last 30 days
  const suspended30 = await prisma.business.count({ where: { status: "suspended", updatedAt: { gte: since30 } } })
  const churnRate = totalBusinesses > 0 ? ((suspended30 / totalBusinesses) * 100).toFixed(1) : "0.0"

  // WA reply rate
  const waReplied = await prisma.whatsappMessage.count({
    where: { direction: "outbound", repliedAt: { not: null }, createdAt: { gte: since30 } },
  })
  const waTotal = waStats._count.id
  const replyRate = waTotal > 0 ? Math.round((waReplied / waTotal) * 100) : 0

  // Onboarding funnel
  const [signedup, configuredWa, firstVisit, tenCustomers] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { whatsappConfig: { isConnected: true } } }),
    prisma.business.count({ where: { visits: { some: {} } } }),
    prisma.business.count({ where: { customers: { some: {} } } }),
  ])

  return {
    totalBusinesses,
    newThisMonth,
    mrr,
    churnRate,
    replyRate,
    planDist: planDist.map((p) => ({ plan: p.plan, count: p._count.plan })),
    cityDist: cityDist.map((c) => ({ city: c.city, count: c._count.city })),
    funnel: { signedup, configuredWa, firstVisit, tenCustomers, active: signedup },
    mrrChange: newLast30 - newPrev30,
  }
}

export default async function AdminOverview() {
  const data = await getData()
  const totalPlan = data.planDist.reduce((s, p) => s + p.count, 0) || 1

  return (
    <div className="p-6 space-y-6">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-text-primary">Platform overview</h1>
        <p className="text-sm text-text-secondary mt-0.5">Live metrics from database</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total businesses"
          value={data.totalBusinesses.toString()}
          change={`+${data.newThisMonth} this month`}
          changePositive
          accentColor="teal"
          icon={<Building2 size={16} />}
        />
        <StatCard
          title="MRR"
          value={`₹${(data.mrr / 100000).toFixed(1)}L`}
          change={`${data.mrrChange >= 0 ? "+" : ""}${data.mrrChange} vs last mo`}
          changePositive={data.mrrChange >= 0}
          accentColor="green"
          icon={<IndianRupee size={16} />}
        />
        <StatCard
          title="Churn rate"
          value={`${data.churnRate}%`}
          change="Last 30 days"
          accentColor="blue"
          icon={<TrendingDown size={16} />}
        />
        <StatCard
          title="WA reply rate"
          value={`${data.replyRate}%`}
          change="Last 30 days"
          changePositive={data.replyRate > 50}
          accentColor="amber"
          icon={<MessageCircle size={16} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card glass>
          <h2 className="text-sm font-semibold text-text-primary mb-4">Plan distribution</h2>
          <div className="space-y-3">
            {data.planDist.map((p) => {
              const pct = Math.round((p.count / totalPlan) * 100)
              return (
                <div key={p.plan}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-secondary capitalize">{p.plan}</span>
                    <span className="text-text-primary font-medium">{p.count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card glass>
          <h2 className="text-sm font-semibold text-text-primary mb-4">Top cities</h2>
          <div className="space-y-2">
            {data.cityDist.map((c) => (
              <div key={c.city} className="text-sm text-text-secondary hover:text-text-primary transition-colors py-1 border-b border-white/5 flex justify-between">
                <span>{c.city}</span>
                <Badge color="purple" variant="subtle">{c.count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card glass>
        <h2 className="text-sm font-semibold text-text-primary mb-5">Onboarding pipeline</h2>
        <div className="flex gap-0 overflow-x-auto">
          {[
            { stage: "Signed up",       count: data.funnel.signedup,     color: "bg-purple-500" },
            { stage: "Configured WA",   count: data.funnel.configuredWa, color: "bg-trust-500" },
            { stage: "First visit",     count: data.funnel.firstVisit,   color: "bg-clarity-500" },
            { stage: "Has customers",   count: data.funnel.tenCustomers, color: "bg-growth-500" },
          ].map((s, i) => (
            <div key={i} className="flex-1 min-w-24 text-center">
              <div className={`h-16 ${s.color} mx-1 rounded flex items-center justify-center`} style={{ opacity: 0.3 + i * 0.18 }}>
                <span className="text-white text-lg font-bold">{s.count}</span>
              </div>
              <p className="text-[10px] text-text-tertiary mt-2 leading-tight">{s.stage}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
