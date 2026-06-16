import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const logs = [
  { user: "admin@alohive.in", action: "Plan changed", detail: "Gloss Studio: Starter → Growth", ip: "106.51.xx.xx", time: "10 min ago", type: "billing" },
  { user: "priya@glossstudio.com", action: "Data export", detail: "Customer list CSV downloaded", ip: "192.168.1.x", time: "1h ago", type: "data" },
  { user: "admin@alohive.in", action: "Business suspended", detail: "Fashion Hub suspended (failed payment)", ip: "106.51.xx.xx", time: "2h ago", type: "admin" },
  { user: "kavya@glossstudio.com", action: "Login", detail: "Successful login from Chrome/Windows", ip: "192.168.2.x", time: "3h ago", type: "auth" },
  { user: "admin@alohive.in", action: "Feature flag toggled", detail: "multi_location → enabled for Pro", ip: "106.51.xx.xx", time: "Yesterday", type: "admin" },
  { user: "rahul@fashionhub.com", action: "Failed login", detail: "3 failed attempts from same IP", ip: "49.204.xx.xx", time: "Yesterday", type: "security" },
]

const typeColor = { billing: "green", data: "blue", admin: "purple", auth: "teal", security: "red" } as const

export default function AuditLog() {
  return (
    <div className="p-6 space-y-5">
      <h1 className="text-xl font-bold text-text-primary">Audit log</h1>

      <div className="flex gap-3">
        <div className="flex-1">
          <Input theme="dark" placeholder="Filter by user, action, or IP…" icon={<Search size={15} />} />
        </div>
      </div>

      <Card glass className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {["User", "Action", "Details", "IP", "Type", "Time"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className="border-b border-slate-800/50 hover:bg-white/2 transition-colors">
                <td className="px-5 py-3.5 text-text-secondary text-xs font-mono">{log.user}</td>
                <td className="px-5 py-3.5 font-medium text-text-primary text-sm">{log.action}</td>
                <td className="px-5 py-3.5 text-text-secondary text-xs max-w-xs truncate">{log.detail}</td>
                <td className="px-5 py-3.5 text-text-tertiary text-xs font-mono">{log.ip}</td>
                <td className="px-5 py-3.5">
                  <Badge color={typeColor[log.type as keyof typeof typeColor]} variant="subtle">{log.type}</Badge>
                </td>
                <td className="px-5 py-3.5 text-text-tertiary text-xs">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
