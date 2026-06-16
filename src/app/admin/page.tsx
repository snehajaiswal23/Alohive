import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, IndianRupee, TrendingDown, MessageCircle, TrendingUp } from "lucide-react"

const planDist = [
  { plan: "Starter", count: 42, pct: 35 },
  { plan: "Growth", count: 68, pct: 57 },
  { plan: "Pro", count: 10, pct: 8 },
]

const cities = ["Bangalore (48)", "Mumbai (28)", "Delhi (22)", "Hyderabad (14)", "Pune (8)"]

export default function AdminOverview() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-text-primary">Platform overview</h1>
        <p className="text-sm text-text-secondary mt-0.5">Real-time platform metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total businesses" value="120" change="+8 this month" changePositive accentColor="teal" icon={<Building2 size={16} />} />
        <StatCard title="MRR" value="₹2.1L" change="+12% vs last mo" changePositive accentColor="green" icon={<IndianRupee size={16} />} />
        <StatCard title="Churn rate" value="2.4%" change="-0.5% vs last mo" changePositive accentColor="blue" icon={<TrendingDown size={16} />} />
        <StatCard title="WA reply rate" value="68%" change="+3% vs last mo" changePositive accentColor="amber" icon={<MessageCircle size={16} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card glass>
          <h2 className="text-sm font-semibold text-text-primary mb-4">Plan distribution</h2>
          <div className="space-y-3">
            {planDist.map((p) => (
              <div key={p.plan}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">{p.plan}</span>
                  <span className="text-text-primary font-medium">{p.count} ({p.pct}%)</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card glass>
          <h2 className="text-sm font-semibold text-text-primary mb-4">City distribution</h2>
          <div className="space-y-2">
            {cities.map((c) => (
              <div key={c} className="text-sm text-text-secondary hover:text-text-primary transition-colors py-1 border-b border-white/5 flex justify-between">
                <span>{c.split("(")[0].trim()}</span>
                <Badge color="purple" variant="subtle">{c.match(/\((\d+)\)/)?.[1]}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Onboarding funnel */}
      <Card glass>
        <h2 className="text-sm font-semibold text-text-primary mb-5">Onboarding pipeline</h2>
        <div className="flex gap-0 overflow-x-auto">
          {[
            { stage: "Signed up", count: 142, color: "bg-purple-500" },
            { stage: "Configured WA", count: 128, color: "bg-trust-500" },
            { stage: "First visit logged", count: 115, color: "bg-clarity-500" },
            { stage: "10+ customers", count: 98, color: "bg-growth-500" },
            { stage: "Active (30d)", count: 120, color: "bg-growth-400" },
          ].map((s, i) => (
            <div key={i} className="flex-1 min-w-24 text-center">
              <div className={`h-16 ${s.color} mx-1 rounded flex items-center justify-center`} style={{ opacity: 0.3 + i * 0.14 }}>
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
