import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, TrendingUp, CheckCircle, XCircle } from "lucide-react"
import { AdminWaChart } from "@/components/admin/admin-wa-chart"

async function getData() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const res  = await fetch(`${base}/api/admin/wa-stats`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

export default async function PlatformHealth() {
  const data = await getData()
  if (!data) {
    return <div className="p-6 text-text-tertiary text-sm">Failed to load WhatsApp stats</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Platform health</h1>
        <p className="text-sm text-text-secondary mt-0.5">WhatsApp message stats — last 30 days</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Messages sent"  value={data.totalSent.toLocaleString("en-IN")} accentColor="teal"  icon={<MessageCircle size={16} />} />
        <StatCard title="Delivery rate"  value={`${data.deliveryRate}%`}  changePositive={data.deliveryRate >= 90} accentColor="green"  icon={<CheckCircle  size={16} />} />
        <StatCard title="Read rate"      value={`${data.readRate}%`}      changePositive={data.readRate >= 70}     accentColor="blue"   icon={<TrendingUp   size={16} />} />
        <StatCard title="Reply rate"     value={`${data.replyRate}%`}     changePositive={data.replyRate >= 20}    accentColor="amber"  icon={<MessageCircle size={16} />} />
      </div>

      {data.daily.length > 0 && (
        <Card glass>
          <h2 className="text-sm font-semibold text-text-primary mb-4">Daily send volume (14 days)</h2>
          <AdminWaChart data={data.daily} />
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card glass>
          <h2 className="text-sm font-semibold text-text-primary mb-4">Delivery funnel</h2>
          <div className="space-y-3">
            {[
              { label: "Sent",      count: data.totalSent,  color: "bg-teal-500" },
              { label: "Delivered", count: data.delivered,  color: "bg-blue-500" },
              { label: "Read",      count: data.read,       color: "bg-green-500" },
              { label: "Replied",   count: data.replied,    color: "bg-amber-500" },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">{row.label}</span>
                  <span className="text-text-primary font-medium">{row.count.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${row.color} rounded-full`}
                    style={{ width: data.totalSent > 0 ? `${(row.count / data.totalSent) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card glass>
          <h2 className="text-sm font-semibold text-text-primary mb-4">Top templates</h2>
          {data.topTemplates.length === 0 ? (
            <p className="text-text-tertiary text-sm">No template data yet</p>
          ) : (
            <div className="space-y-2">
              {data.topTemplates.map((t: { name: string | null; count: number }, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-text-secondary font-mono">{t.name ?? "—"}</span>
                  <span className="text-sm font-medium text-text-primary">{t.count.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {data.failed > 0 && (
        <Card glass className="border border-red-800/30 bg-red-900/10">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <p className="text-sm font-medium text-red-300">{data.failed.toLocaleString()} failed messages in the last 30 days</p>
          </div>
          <p className="text-xs text-text-tertiary mt-1 ml-6">Check Gupshup dashboard for error details and delivery logs.</p>
        </Card>
      )}
    </div>
  )
}
