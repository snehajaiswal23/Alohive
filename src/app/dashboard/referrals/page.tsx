import { Topbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/ui/stat-card"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Share2, TrendingUp, Users, CheckCircle } from "lucide-react"

const topReferrers = [
  { name: "Kiran Desai", referrals: 5, converted: 4, reward: "₹400" },
  { name: "Aditi Sharma", referrals: 3, converted: 3, reward: "₹300" },
  { name: "Rohan Gupta", referrals: 2, converted: 1, reward: "₹100" },
]

export default function ReferralsPage() {
  return (
    <div>
      <Topbar title="Referrals" subtitle="Track and manage your referral program" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard theme="light" title="Total referrals sent" value="18" accentColor="teal" icon={<Share2 size={16} />} />
          <StatCard theme="light" title="Converted" value="12" change="67% conversion" changePositive accentColor="green" icon={<CheckCircle size={16} />} />
          <StatCard theme="light" title="Conversion rate" value="67%" change="+8% vs last mo" changePositive accentColor="blue" icon={<TrendingUp size={16} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashCard>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Top referrers</h2>
              <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg text-xs">
                <Users size={12} /> Send nudge
              </Button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Customer", "Sent", "Converted", "Reward"].map((h) => (
                    <th key={h} className="text-left pb-2 text-xs font-semibold text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topReferrers.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-3 font-medium text-gray-800">{r.name}</td>
                    <td className="py-3 text-gray-600">{r.referrals}</td>
                    <td className="py-3">
                      <Badge color="green" variant="subtle">{r.converted}</Badge>
                    </td>
                    <td className="py-3 font-medium text-growth-600">{r.reward}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DashCard>

          <DashCard>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Referral reward settings</h2>
            <div className="space-y-3">
              {[
                { label: "Referrer reward", value: "₹100 per converted referral" },
                { label: "Referee reward", value: "10% off first visit" },
                { label: "Minimum spend to qualify", value: "₹500" },
                { label: "Expiry", value: "30 days" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-600">{row.label}</span>
                  <span className="font-medium text-gray-800">{row.value}</span>
                </div>
              ))}
              <button className="w-full mt-1 text-sm text-clarity-600 font-medium hover:text-clarity-700 py-2">
                Edit reward settings →
              </button>
            </div>
          </DashCard>
        </div>
      </div>
    </div>
  )
}
