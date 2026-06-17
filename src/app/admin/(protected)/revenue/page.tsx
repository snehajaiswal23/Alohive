import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IndianRupee, TrendingDown, TrendingUp, AlertCircle } from "lucide-react"
import { AdminRevenueChart } from "@/components/admin/admin-revenue-chart"

async function getData() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const res  = await fetch(`${base}/api/admin/revenue`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

export default async function AdminRevenue() {
  const data = await getData()
  if (!data) {
    return <div className="p-6 text-text-tertiary text-sm">Failed to load revenue data</div>
  }

  const planColors: Record<string, string> = { starter: "gray", growth: "teal", pro: "purple", trial: "amber" }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-text-primary">Revenue</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="MRR"
          value={`₹${(data.mrr / 1000).toFixed(0)}k`}
          change={`${data.newThisMonth} new this month`}
          changePositive
          accentColor="green"
          icon={<IndianRupee size={16} />}
        />
        <StatCard
          title="ARR"
          value={`₹${(data.arr / 100000).toFixed(1)}L`}
          change="Annualized"
          changePositive
          accentColor="teal"
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          title="Active plans"
          value={data.planDist.reduce((s: number, p: { count: number }) => s + p.count, 0).toString()}
          change="Across all tiers"
          changePositive
          accentColor="blue"
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          title="Failed payments"
          value={data.failedInvoices.length.toString()}
          change="Need attention"
          accentColor="red"
          icon={<TrendingDown size={16} />}
        />
      </div>

      {data.monthly.length > 0 && (
        <Card glass>
          <h2 className="text-sm font-semibold text-text-primary mb-4">Monthly revenue (invoiced)</h2>
          <AdminRevenueChart data={data.monthly} />
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card glass>
          <h2 className="text-sm font-semibold text-text-primary mb-4">Plan distribution</h2>
          <div className="space-y-3">
            {data.planDist.map((p: { plan: string; count: number }) => (
              <div key={p.plan} className="flex items-center gap-3">
                <Badge color={planColors[p.plan.toLowerCase()] as "gray" | "teal" | "purple" | "amber" ?? "gray"} variant="subtle" className="w-16 text-center">
                  {p.plan}
                </Badge>
                <span className="text-sm font-medium text-text-primary">{p.count} businesses</span>
              </div>
            ))}
          </div>
        </Card>

        <Card glass>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-semibold text-text-primary">Failed payments ({data.failedInvoices.length})</h2>
          </div>
          {data.failedInvoices.length === 0 ? (
            <p className="text-sm text-text-tertiary">No failed payments</p>
          ) : (
            <div className="space-y-3">
              {data.failedInvoices.map((inv: { id: string; amount: number; business: { name: string; plan: string }; createdAt: string }) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-red-900/10 border border-red-800/30">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{inv.business.name}</p>
                    <p className="text-xs text-text-secondary">{inv.business.plan} · {new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <span className="text-sm font-bold text-red-400">₹{inv.amount.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
