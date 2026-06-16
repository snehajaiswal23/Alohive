import { Topbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/ui/stat-card"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RotateCcw, Users, TrendingUp, Play, Pause } from "lucide-react"

const campaigns = [
  { name: "30-day nudge", trigger: "30 days inactive", status: "running", sent: 24, replies: 8, recovered: 5 },
  { name: "60-day offer", trigger: "60 days inactive", status: "running", sent: 12, replies: 3, recovered: 2 },
  { name: "90-day last chance", trigger: "90 days inactive", status: "paused", sent: 6, replies: 1, recovered: 0 },
  { name: "VIP win-back", trigger: "Gold/Platinum only, 30d", status: "draft", sent: 0, replies: 0, recovered: 0 },
]

const statusColor = { running: "green", paused: "amber", draft: "gray" } as const

export default function WinbackPage() {
  return (
    <div>
      <Topbar title="Win-back Campaigns" subtitle="Re-engage inactive customers automatically" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard theme="light" title="Inactive 30d" value="24" accentColor="amber" icon={<Users size={16} />} />
          <StatCard theme="light" title="Inactive 60d" value="12" accentColor="red" icon={<Users size={16} />} />
          <StatCard theme="light" title="Inactive 90d" value="6" accentColor="red" icon={<Users size={16} />} />
          <StatCard theme="light" title="Recovered this month" value="7" change="+3 vs last mo" changePositive accentColor="green" icon={<RotateCcw size={16} />} />
        </div>

        <div className="flex justify-end">
          <Button variant="primary" size="sm">
            + New campaign
          </Button>
        </div>

        <DashCard className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Active campaigns</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Campaign", "Trigger", "Status", "Sent", "Replies", "Recovered", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{c.name}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{c.trigger}</td>
                  <td className="px-5 py-3.5">
                    <Badge color={statusColor[c.status as keyof typeof statusColor]} variant="subtle">{c.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">{c.sent}</td>
                  <td className="px-5 py-3.5 text-gray-700">{c.replies}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-growth-600">{c.recovered}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-700 rounded-lg p-1.5">
                      {c.status === "running" ? <Pause size={14} /> : <Play size={14} />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashCard>

        {/* New campaign form */}
        <DashCard>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Create new campaign</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Campaign name", placeholder: "e.g. Summer win-back" },
              { label: "Trigger (days inactive)", placeholder: "e.g. 30" },
              { label: "Offer / message", placeholder: "e.g. We miss you! Come back for 20% off" },
              { label: "Schedule", placeholder: "Daily at 10:00 AM" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label>
                <input
                  className="w-full rounded-[8px] px-3 py-2.5 text-sm border border-gray-200 focus:border-clarity-500 focus:ring-1 focus:ring-clarity-500/20 outline-none transition-all"
                  placeholder={f.placeholder}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="primary" size="sm">Save campaign</Button>
          </div>
        </DashCard>
      </div>
    </div>
  )
}
