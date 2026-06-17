import { StaffTopbar } from "@/components/staff/staff-topbar"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, MessageCircle, Gift, AlertCircle } from "lucide-react"
import Link from "next/link"

const recentCheckins = [
  { name: "Aditi Sharma", service: "Hair color", time: "10 min ago", wa: true },
  { name: "Ravi Kumar",   service: "Haircut",    time: "32 min ago", wa: true },
  { name: "Meera Nair",   service: "Hair spa",   time: "1h ago",     wa: true },
]

export default function StaffHome() {
  return (
    <div>
      <StaffTopbar title="Today" subtitle="Sunday, 15 June 2025" alertCount={2} />

      <div className="p-6 space-y-5 max-w-3xl">
        {/* 4 metric cards */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Visits logged", value: "14", Icon: ClipboardList, color: "bg-trust-50 text-trust-600" },
            { label: "WA messages sent", value: "12", Icon: MessageCircle, color: "bg-blue-50 text-blue-600" },
            { label: "Points redeemed", value: "3",  Icon: Gift,          color: "bg-growth-50 text-growth-600" },
            { label: "Alerts pending", value: "2",   Icon: AlertCircle,   color: "bg-red-50 text-red-600" },
          ].map(({ label, value, Icon, color }) => (
            <DashCard key={label} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </DashCard>
          ))}
        </div>

        {/* Unhappy alert banner */}
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Sunita Patel left unhappy feedback</p>
            <p className="text-xs text-red-500 mt-0.5">Facial · 45 min wait · 2 stars</p>
          </div>
          <Link href="/dashboard/alerts" className="text-xs font-medium text-red-600 hover:text-red-800 shrink-0 mt-0.5">
            View →
          </Link>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/log-visit">
            <DashCard className="flex flex-col items-center justify-center gap-2 py-6 hover:border-trust-300 hover:bg-trust-50/40 transition-all cursor-pointer text-center">
              <ClipboardList className="w-6 h-6 text-trust-500" />
              <p className="text-sm font-semibold text-gray-800">Log a visit</p>
              <p className="text-xs text-gray-400">Check in a customer</p>
            </DashCard>
          </Link>
          <Link href="/dashboard/find-customer">
            <DashCard className="flex flex-col items-center justify-center gap-2 py-6 hover:border-trust-300 hover:bg-trust-50/40 transition-all cursor-pointer text-center">
              <Gift className="w-6 h-6 text-trust-500" />
              <p className="text-sm font-semibold text-gray-800">Redeem points</p>
              <p className="text-xs text-gray-400">Look up loyalty balance</p>
            </DashCard>
          </Link>
        </div>

        {/* Recent check-ins */}
        <DashCard>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Recent check-ins</h2>
            <Link href="/dashboard/log-visit" className="text-xs font-medium text-trust-600 hover:text-trust-700">
              + Log new
            </Link>
          </div>
          <div className="space-y-3">
            {recentCheckins.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-trust-100 flex items-center justify-center text-xs font-bold text-trust-700">
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.service}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-gray-400">{c.time}</span>
                  {c.wa && <Badge color="green" variant="subtle">WA sent</Badge>}
                </div>
              </div>
            ))}
          </div>
        </DashCard>
      </div>
    </div>
  )
}
