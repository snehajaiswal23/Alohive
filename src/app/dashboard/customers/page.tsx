import { Topbar } from "@/components/dashboard/topbar"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Filter } from "lucide-react"

const customers = [
  { name: "Aditi Sharma", phone: "+91 98765 43210", visits: 14, lastVisit: "2 hours ago", points: 1420, tier: "Gold", risk: null },
  { name: "Ravi Kumar", phone: "+91 87654 32109", visits: 7, lastVisit: "3 days ago", points: 680, tier: "Silver", risk: null },
  { name: "Sunita Patel", phone: "+91 76543 21098", visits: 3, lastVisit: "12 days ago", points: 240, tier: "Bronze", risk: "At risk" },
  { name: "Kiran Desai", phone: "+91 65432 10987", visits: 22, lastVisit: "Yesterday", points: 2200, tier: "Platinum", risk: null },
  { name: "Meera Nair", phone: "+91 54321 09876", visits: 1, lastVisit: "45 days ago", points: 100, tier: "Bronze", risk: "Inactive 30d" },
  { name: "Rohan Gupta", phone: "+91 43210 98765", visits: 9, lastVisit: "1 week ago", points: 890, tier: "Silver", risk: null },
]

const tierColor = { Bronze: "amber", Silver: "gray", Gold: "amber", Platinum: "blue" } as const
const riskColor = { "At risk": "amber", "Inactive 30d": "red" } as const

export default function CustomersPage() {
  return (
    <div>
      <Topbar title="Customers" subtitle="View and manage your customer base" />
      <div className="p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48">
            <Input theme="light" placeholder="Search by name or phone..." icon={<Search size={15} />} />
          </div>
          <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg">
            <Filter size={14} /> Filters
          </Button>
          <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg">
            <Download size={14} /> Export CSV
          </Button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {["All", "VIP", "Loyal", "At risk", "Inactive 30d", "New"].map((f) => (
            <button key={f} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-clarity-400 hover:text-clarity-700 transition-colors">
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <DashCard className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Customer", "Phone", "Visits", "Last visit", "Points", "Tier", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-clarity-100 flex items-center justify-center text-xs font-bold text-clarity-700">
                        {c.name[0]}
                      </div>
                      <span className="font-medium text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{c.phone}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{c.visits}</td>
                  <td className="px-5 py-3.5 text-gray-500">{c.lastVisit}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{c.points.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <Badge color={tierColor[c.tier as keyof typeof tierColor]} variant="subtle">{c.tier}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    {c.risk ? (
                      <Badge color={riskColor[c.risk as keyof typeof riskColor]} variant="subtle">{c.risk}</Badge>
                    ) : (
                      <Badge color="green" variant="subtle">Active</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashCard>
      </div>
    </div>
  )
}
