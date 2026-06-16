import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, CheckCircle, Activity, Cpu } from "lucide-react"

const apiStatus = [
  { name: "WhatsApp BSP (Gupshup)", status: "operational", latency: "120ms" },
  { name: "Google Business Profile API", status: "operational", latency: "240ms" },
  { name: "Razorpay", status: "operational", latency: "95ms" },
  { name: "OpenAI API", status: "degraded", latency: "1.4s" },
  { name: "Supabase DB", status: "operational", latency: "18ms" },
]

const statusColor = { operational: "green", degraded: "amber", down: "red" } as const

export default function PlatformHealth() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-text-primary">Platform health</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Messages today" value="1,842" accentColor="teal" icon={<MessageCircle size={16} />} />
        <StatCard title="Delivered" value="1,798" change="97.6%" changePositive accentColor="green" icon={<CheckCircle size={16} />} />
        <StatCard title="API quota used" value="34%" accentColor="blue" icon={<Cpu size={16} />} />
        <StatCard title="System uptime" value="99.9%" accentColor="green" icon={<Activity size={16} />} />
      </div>

      <Card glass>
        <h2 className="text-sm font-semibold text-text-primary mb-4">API status</h2>
        <div className="space-y-3">
          {apiStatus.map((api) => (
            <div key={api.name} className="flex items-center justify-between py-2.5 border-b border-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${api.status === "operational" ? "bg-growth-400" : "bg-amber-400"}`} />
                <span className="text-sm text-text-primary">{api.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-tertiary">{api.latency}</span>
                <Badge color={statusColor[api.status as keyof typeof statusColor]} variant="subtle">{api.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card glass>
        <h2 className="text-sm font-semibold text-text-primary mb-4">WA message stats today</h2>
        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            { label: "Sent", value: "1,842", color: "text-clarity-400" },
            { label: "Delivered", value: "1,798", color: "text-growth-400" },
            { label: "Read", value: "1,204", color: "text-trust-400" },
            { label: "Replied", value: "782", color: "text-amber-400" },
          ].map((s) => (
            <div key={s.label}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-text-secondary mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
