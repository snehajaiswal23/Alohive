"use client"
import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

type Log = {
  id: string
  action: string
  details: Record<string, string> | null
  ipAddress: string | null
  createdAt: string
  business: { name: string } | null
}

function actionType(action: string): "billing" | "admin" | "auth" | "security" | "data" {
  if (/login|logout|2fa/i.test(action)) return "auth"
  if (/suspend|reactivate|plan|flag/i.test(action)) return "admin"
  if (/payment|revenue|invoice/i.test(action)) return "billing"
  if (/failed|attempt|block/i.test(action)) return "security"
  return "data"
}

const typeColor = { billing: "green", data: "blue", admin: "purple", auth: "teal", security: "red" } as const

export default function AuditLog() {
  const [logs, setLogs] = useState<Log[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (q) params.set("q", q)
    const res = await fetch(`/api/admin/audit-log?${params}`)
    const data = await res.json()
    setLogs(data.logs ?? [])
    setTotal(data.total ?? 0)
    setPages(data.pages ?? 1)
    setLoading(false)
  }, [page, q])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">
          Audit log <span className="text-text-tertiary text-sm font-normal ml-1">({total})</span>
        </h1>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            theme="dark"
            placeholder="Filter by action or IP…"
            icon={<Search size={15} />}
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      <Card glass className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {["Action", "Details", "Business", "IP", "Type", "Time"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-text-tertiary text-sm">Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-text-tertiary text-sm">No logs found</td></tr>
            ) : logs.map((log) => {
              const type = actionType(log.action)
              return (
                <tr key={log.id} className="border-b border-slate-800/50 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-medium text-text-primary text-sm">{log.action}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs max-w-xs truncate">
                    {log.details?.detail ?? JSON.stringify(log.details ?? "")}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{log.business?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-text-tertiary text-xs font-mono">{log.ipAddress ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge color={typeColor[type]} variant="subtle">{type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-text-tertiary text-xs">
                    {new Date(log.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {pages > 1 && (
        <div className="flex items-center gap-3 justify-end">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            <ChevronLeft size={14} />
          </Button>
          <span className="text-xs text-text-secondary">Page {page} of {pages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === pages}>
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  )
}
