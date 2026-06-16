import { Topbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/ui/stat-card"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart2, Star, Gift, RotateCcw, AlertCircle, TrendingUp } from "lucide-react"

const recentActivity = [
  { name: "Aditi Sharma", service: "Hair color", time: "10 min ago", sentiment: "happy" },
  { name: "Ravi Kumar", service: "Haircut", time: "32 min ago", sentiment: "neutral" },
  { name: "Sunita Patel", service: "Facial", time: "1h ago", sentiment: "unhappy" },
  { name: "Kiran Desai", service: "Manicure", time: "2h ago", sentiment: "happy" },
  { name: "Meera Nair", service: "Hair spa", time: "3h ago", sentiment: "happy" },
]

const sentimentColor = { happy: "green", neutral: "amber", unhappy: "red" } as const

export default function DashboardHome() {
  return (
    <div>
      <Topbar title="Good morning, Priya" subtitle="Gloss Studio · Koramangala" />
      <div className="p-6 space-y-6">

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard theme="light" title="Visits today" value="24" change="+3 vs yesterday" changePositive accentColor="teal" icon={<BarChart2 size={16} />} />
          <StatCard theme="light" title="New Google reviews" value="7" change="+2 this week" changePositive accentColor="blue" icon={<Star size={16} />} />
          <StatCard theme="light" title="Points redeemed" value="1,240" change="4 customers" changePositive accentColor="green" icon={<Gift size={16} />} />
          <StatCard theme="light" title="Win-back sent" value="12" change="3 recovered" changePositive accentColor="amber" icon={<RotateCcw size={16} />} />
        </div>

        {/* Alert banner */}
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-[12px] px-5 py-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-700">2 unhappy customers need attention</p>
            <p className="text-xs text-red-500 mt-0.5">Sunita Patel (facial) and Rahul Mishra (haircut) left negative feedback</p>
          </div>
          <a href="/dashboard/reviews" className="text-xs font-medium text-red-600 hover:text-red-700 shrink-0">View →</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's feedback */}
          <DashCard>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Today&apos;s feedback</h2>
            <div className="space-y-3">
              {[
                { label: "Happy (4-5 ★)", count: 18, total: 24, color: "bg-growth-500" },
                { label: "Neutral (3 ★)", count: 4, total: 24, color: "bg-amber-400" },
                { label: "Unhappy (1-2 ★)", count: 2, total: 24, color: "bg-red-400" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{row.label}</span>
                    <span className="font-medium text-gray-800">{row.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${row.color} rounded-full`}
                      style={{ width: `${(row.count / row.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DashCard>

          {/* Review summary */}
          <DashCard>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Google review summary</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold text-gray-900">4.7</div>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className={`text-lg ${s <= 4 ? "text-amber-400" : "text-gray-200"}`}>★</span>
                  ))}
                </div>
                <p className="text-xs text-gray-500">142 total reviews</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-growth-600 bg-growth-50 rounded-lg px-3 py-2">
              <TrendingUp size={14} />
              <span>+18 reviews this month (+14%)</span>
            </div>
          </DashCard>
        </div>

        {/* Recent activity */}
        <DashCard>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Recent check-ins</h2>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.service}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{item.time}</span>
                  <Badge color={sentimentColor[item.sentiment as keyof typeof sentimentColor]} variant="subtle">
                    {item.sentiment}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </DashCard>
      </div>
    </div>
  )
}
