import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IndianRupee, TrendingDown, TrendingUp, AlertCircle } from "lucide-react"

const failedPayments = [
  { business: "The Brew House", plan: "Starter", amount: "₹999", date: "Jun 10" },
  { business: "Fashion Hub", plan: "Starter", amount: "₹999", date: "Jun 12" },
]

export default function AdminRevenue() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-text-primary">Revenue</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="MRR" value="₹2.1L" change="+12% vs last mo" changePositive accentColor="green" icon={<IndianRupee size={16} />} />
        <StatCard title="ARR" value="₹25.2L" change="+12%" changePositive accentColor="teal" icon={<TrendingUp size={16} />} />
        <StatCard title="New MRR" value="₹18,000" change="+8 new this mo" changePositive accentColor="blue" icon={<TrendingUp size={16} />} />
        <StatCard title="Churned MRR" value="₹4,000" change="−2 churned" accentColor="red" icon={<TrendingDown size={16} />} />
      </div>

      {/* Failed payments */}
      <Card glass>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-text-primary">Failed payments ({failedPayments.length})</h2>
        </div>
        <div className="space-y-3">
          {failedPayments.map((p, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-900/10 border border-red-800/30">
              <div>
                <p className="text-sm font-medium text-text-primary">{p.business}</p>
                <p className="text-xs text-text-secondary">{p.plan} · {p.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-red-400">{p.amount}</span>
                <Button variant="outline" size="sm" className="text-xs border-white/10">Retry</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card glass>
        <h2 className="text-sm font-semibold text-text-primary mb-4">Subscription controls</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Apply discount", "Extend trial", "Force plan change", "Issue refund"].map((action) => (
            <Button key={action} variant="outline" size="sm" className="border-white/10 text-text-secondary hover:text-text-primary text-xs">
              {action}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  )
}
