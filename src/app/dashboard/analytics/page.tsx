import { Topbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/ui/stat-card"
import { DashCard } from "@/components/ui/card"
import { TrendingUp, Users, IndianRupee, BarChart2 } from "lucide-react"

const peakHours = [
  [0,0,0,0,0,0,1,2,3,3,4,5],
  [0,0,0,0,0,0,1,3,4,5,5,4],
  [0,0,0,0,0,0,0,2,3,4,5,5],
  [0,0,0,0,0,0,1,2,3,4,4,3],
  [0,0,0,0,0,0,2,3,4,5,5,4],
  [0,0,0,0,0,0,3,4,5,5,5,4],
  [0,0,0,0,0,0,1,2,2,3,3,2],
]
const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
const hours = ["9","10","11","12","13","14","15","16","17","18","19","20"]

const heatColor = ["bg-gray-100","bg-growth-100","bg-growth-200","bg-growth-300","bg-growth-400","bg-growth-500"]

const staffPerf = [
  { name: "Priya Mehta", visits: 82, rating: 4.9, revenue: "₹41,000" },
  { name: "Kavya Rao", visits: 64, rating: 4.7, revenue: "₹32,000" },
  { name: "Sneha Iyer", visits: 58, rating: 4.5, revenue: "₹29,000" },
]

export default function AnalyticsPage() {
  return (
    <div>
      <Topbar title="Analytics" subtitle="Business performance insights" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard theme="light" title="Monthly revenue" value="₹1.02L" change="+12% vs last mo" changePositive accentColor="green" icon={<IndianRupee size={16} />} />
          <StatCard theme="light" title="Total visits (mo)" value="204" change="+8% vs last mo" changePositive accentColor="teal" icon={<Users size={16} />} />
          <StatCard theme="light" title="Avg customer LTV" value="₹3,400" change="+5%" changePositive accentColor="blue" icon={<TrendingUp size={16} />} />
          <StatCard theme="light" title="Retention rate" value="68%" change="+3% vs last mo" changePositive accentColor="amber" icon={<BarChart2 size={16} />} />
        </div>

        {/* Peak hours heatmap */}
        <DashCard>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Peak hours heatmap</h2>
          <div className="overflow-x-auto">
            <div className="flex gap-3">
              {/* Y-axis labels */}
              <div className="flex flex-col gap-1 pt-5">
                {days.map((d) => (
                  <div key={d} className="h-7 flex items-center text-xs text-gray-400 w-8">{d}</div>
                ))}
              </div>
              <div>
                {/* X-axis labels */}
                <div className="flex gap-1 mb-1">
                  {hours.map((h) => (
                    <div key={h} className="w-7 text-center text-xs text-gray-400">{h}</div>
                  ))}
                </div>
                {/* Heatmap grid */}
                {peakHours.map((row, di) => (
                  <div key={di} className="flex gap-1 mb-1">
                    {row.map((val, hi) => (
                      <div
                        key={hi}
                        className={`w-7 h-7 rounded ${heatColor[val]} transition-all`}
                        title={`${days[di]} ${hours[hi]}:00 — ${val === 0 ? "quiet" : val === 5 ? "peak" : "moderate"}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
              <span>Low</span>
              {heatColor.map((c, i) => <div key={i} className={`w-4 h-4 rounded ${c}`} />)}
              <span>High</span>
            </div>
          </div>
        </DashCard>

        {/* Staff performance */}
        <DashCard>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Staff performance</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Staff", "Visits", "Rating", "Revenue"].map((h) => (
                  <th key={h} className="text-left pb-2 text-xs font-semibold text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffPerf.map((s, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="py-3 text-gray-600">{s.visits}</td>
                  <td className="py-3 text-amber-600 font-medium">{s.rating} ★</td>
                  <td className="py-3 font-medium text-growth-600">{s.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashCard>
      </div>
    </div>
  )
}
