import { Topbar } from "@/components/dashboard/topbar"
import { DashCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MessageSquare, Users, CreditCard, Bell, Download, Check, X } from "lucide-react"

const sections = [
  {
    icon: Building2,
    title: "Business profile",
    desc: "Name, address, category, logo, opening hours",
    status: "Configured",
    color: "green",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp setup",
    desc: "+91 98765 43210 · Connected via Gupshup",
    status: "Connected",
    color: "green",
  },
  {
    icon: Building2,
    title: "Google review link",
    desc: "maps.google.com/?cid=… · Verified",
    status: "Verified",
    color: "green",
  },
  {
    icon: Users,
    title: "Staff management",
    desc: "3 receptionists · 1 owner",
    status: null,
    color: null,
  },
  {
    icon: CreditCard,
    title: "Plan & billing",
    desc: "Growth plan · ₹2,499/mo · Renews Jul 15",
    status: "Active",
    color: "blue",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "WhatsApp summary, alerts, billing",
    status: null,
    color: null,
  },
]

const staff = [
  { name: "Kavya Rao", role: "Receptionist", email: "kavya@glossstudio.com", active: true },
  { name: "Sneha Iyer", role: "Receptionist", email: "sneha@glossstudio.com", active: true },
  { name: "Rahul Das", role: "Receptionist", email: "rahul@glossstudio.com", active: false },
]

export default function SettingsPage() {
  return (
    <div>
      <Topbar title="Settings" subtitle="Manage your business account and preferences" />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Settings overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((s, i) => (
            <DashCard key={i} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-gray-800 text-sm">{s.title}</p>
                  {s.status && <Badge color={s.color as "green" | "blue"} variant="subtle">{s.status}</Badge>}
                </div>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
              <button className="text-xs text-clarity-600 hover:text-clarity-700 font-medium shrink-0">Edit</button>
            </DashCard>
          ))}
        </div>

        {/* Staff management table */}
        <DashCard>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Staff accounts</h2>
            <Button variant="primary" size="sm">+ Add staff</Button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Name", "Role", "Email", "Status", ""].map((h) => (
                  <th key={h} className="text-left pb-2 text-xs font-semibold text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((s, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="py-3 text-gray-500">{s.role}</td>
                  <td className="py-3 text-gray-500">{s.email}</td>
                  <td className="py-3">
                    <Badge color={s.active ? "green" : "gray"} variant="subtle">
                      {s.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <button className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashCard>

        {/* Data export */}
        <DashCard>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Data export</h2>
          <div className="flex flex-wrap gap-3">
            {["Customer list (CSV)", "Visit history (CSV)", "Loyalty transactions (CSV)", "Campaign performance (CSV)"].map((e) => (
              <Button key={e} variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg">
                <Download size={12} /> {e}
              </Button>
            ))}
          </div>
        </DashCard>
      </div>
    </div>
  )
}
