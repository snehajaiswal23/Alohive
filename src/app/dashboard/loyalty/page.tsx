import { Topbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/ui/stat-card"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Users, TrendingUp, Star } from "lucide-react"

const tiers = [
  { name: "Bronze", range: "0–299 pts", count: 48, color: "bg-amber-500", percent: 40 },
  { name: "Silver", range: "300–799 pts", count: 36, color: "bg-gray-400", percent: 30 },
  { name: "Gold", range: "800–1999 pts", count: 24, color: "bg-amber-400", percent: 20 },
  { name: "Platinum", range: "2000+ pts", count: 12, color: "bg-blue-400", percent: 10 },
]

const topCustomers = [
  { name: "Kiran Desai", points: 2200, tier: "Platinum", visits: 22 },
  { name: "Aditi Sharma", points: 1420, tier: "Gold", visits: 14 },
  { name: "Rohan Gupta", points: 890, tier: "Silver", visits: 9 },
  { name: "Ravi Kumar", points: 680, tier: "Silver", visits: 7 },
  { name: "Priti Singh", points: 460, tier: "Silver", visits: 5 },
]

export default function LoyaltyPage() {
  return (
    <div>
      <Topbar title="Loyalty" subtitle="Manage your loyalty program and tiers" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard theme="light" title="Total members" value="120" accentColor="teal" icon={<Users size={16} />} />
          <StatCard theme="light" title="Points issued (mo)" value="12,400" change="+18% vs last mo" changePositive accentColor="green" icon={<Gift size={16} />} />
          <StatCard theme="light" title="Points redeemed" value="3,800" accentColor="amber" icon={<Star size={16} />} />
          <StatCard theme="light" title="Redemption rate" value="31%" change="+5% vs last mo" changePositive accentColor="blue" icon={<TrendingUp size={16} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tier distribution */}
          <DashCard>
            <h2 className="text-sm font-semibold text-gray-800 mb-5">Tier distribution</h2>
            <div className="space-y-4">
              {tiers.map((tier) => (
                <div key={tier.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-700">{tier.name} <span className="text-gray-400 font-normal">({tier.range})</span></span>
                    <span className="font-medium text-gray-800">{tier.count} customers</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${tier.color} rounded-full`} style={{ width: `${tier.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </DashCard>

          {/* Config panel */}
          <DashCard>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Program settings</h2>
            <div className="space-y-3">
              {[
                { label: "Points per visit", value: "10 pts" },
                { label: "Points per Google review", value: "50 pts" },
                { label: "Points per referral", value: "100 pts" },
                { label: "Redemption rate", value: "100 pts = ₹10" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-600">{row.label}</span>
                  <span className="font-medium text-gray-800">{row.value}</span>
                </div>
              ))}
              <button className="w-full mt-2 text-sm text-clarity-600 font-medium hover:text-clarity-700 py-2">
                Edit settings →
              </button>
            </div>
          </DashCard>
        </div>

        {/* Top customers */}
        <DashCard>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Top loyal customers</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["#", "Customer", "Points", "Tier", "Visits"].map((h) => (
                  <th key={h} className="text-left pb-2 text-xs font-semibold text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="py-3 font-medium text-clarity-700">{c.points.toLocaleString()}</td>
                  <td className="py-3">
                    <Badge color={c.tier === "Platinum" ? "blue" : "amber"} variant="subtle">{c.tier}</Badge>
                  </td>
                  <td className="py-3 text-gray-600">{c.visits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashCard>
      </div>
    </div>
  )
}
