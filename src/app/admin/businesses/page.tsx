import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const businesses = [
  { name: "Gloss Studio", type: "Salon", plan: "Growth", city: "Bangalore", joined: "Jan 12, 2025", status: "active" },
  { name: "The Brew House", type: "Cafe", plan: "Starter", city: "Bangalore", joined: "Feb 3, 2025", status: "active" },
  { name: "Iron Republic", type: "Gym", plan: "Pro", city: "Bangalore", joined: "Mar 7, 2025", status: "active" },
  { name: "Skin Care Clinic", type: "Clinic", plan: "Growth", city: "Mumbai", joined: "Mar 20, 2025", status: "trial" },
  { name: "Fashion Hub", type: "Retail", plan: "Starter", city: "Delhi", joined: "Apr 1, 2025", status: "suspended" },
]

const statusColor = { active: "green", trial: "amber", suspended: "red" } as const
const planColor = { Starter: "gray", Growth: "teal", Pro: "purple" } as const

export default function AdminBusinesses() {
  return (
    <div className="p-6 space-y-5">
      <h1 className="text-xl font-bold text-text-primary">Businesses</h1>

      <div className="flex gap-3">
        <div className="flex-1">
          <Input theme="dark" placeholder="Search by name, city, type…" icon={<Search size={15} />} />
        </div>
        <Button variant="outline" size="sm">Filter</Button>
      </div>

      <Card glass className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {["Business", "Type", "Plan", "City", "Joined", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {businesses.map((b, i) => (
              <tr key={i} className="border-b border-slate-800/50 hover:bg-white/2 transition-colors">
                <td className="px-5 py-3.5 font-medium text-text-primary">{b.name}</td>
                <td className="px-5 py-3.5 text-text-secondary">{b.type}</td>
                <td className="px-5 py-3.5">
                  <Badge color={planColor[b.plan as keyof typeof planColor]} variant="subtle">{b.plan}</Badge>
                </td>
                <td className="px-5 py-3.5 text-text-secondary">{b.city}</td>
                <td className="px-5 py-3.5 text-text-secondary text-xs">{b.joined}</td>
                <td className="px-5 py-3.5">
                  <Badge color={statusColor[b.status as keyof typeof statusColor]} variant="subtle">{b.status}</Badge>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button className="text-xs text-clarity-400 hover:text-clarity-300">Manage</button>
                    {b.status === "active" && <button className="text-xs text-red-400 hover:text-red-300">Suspend</button>}
                    {b.status === "suspended" && <button className="text-xs text-growth-400 hover:text-growth-300">Reactivate</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
