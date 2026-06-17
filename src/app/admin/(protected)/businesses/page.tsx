"use client"
import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

type Business = {
  id: string
  name: string
  type: string
  plan: string
  city: string
  status: string
  createdAt: string
  _count: { customers: number; visits: number }
  subscription?: { status: string }
}

const statusColor = { active: "green", trial: "amber", suspended: "red" } as const
const planColor   = { starter: "gray", growth: "teal", pro: "purple", trial: "amber" } as const

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (q) params.set("q", q)
    const res = await fetch(`/api/admin/businesses?${params}`)
    const data = await res.json()
    setBusinesses(data.businesses ?? [])
    setTotal(data.total ?? 0)
    setPages(data.pages ?? 1)
    setLoading(false)
  }, [page, q])

  useEffect(() => { load() }, [load])

  const doAction = async (id: string, action: string) => {
    setActionLoading(id + action)
    await fetch(`/api/admin/businesses/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    setActionLoading(null)
    load()
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Businesses <span className="text-text-tertiary text-sm font-normal ml-1">({total})</span></h1>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            theme="dark"
            placeholder="Search by name, city, type, phone…"
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
              {["Business", "Type", "Plan", "City", "Customers", "Joined", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-text-tertiary text-sm">Loading…</td></tr>
            ) : businesses.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-text-tertiary text-sm">No businesses found</td></tr>
            ) : businesses.map((b) => (
              <tr key={b.id} className="border-b border-slate-800/50 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-medium text-text-primary">{b.name}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{b.type}</td>
                <td className="px-4 py-3">
                  <Badge color={planColor[b.plan.toLowerCase() as keyof typeof planColor] ?? "gray"} variant="subtle">{b.plan}</Badge>
                </td>
                <td className="px-4 py-3 text-text-secondary text-xs">{b.city}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{b._count.customers}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</td>
                <td className="px-4 py-3">
                  <Badge color={statusColor[b.status as keyof typeof statusColor] ?? "gray"} variant="subtle">{b.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {b.status === "active" && (
                      <button
                        onClick={() => doAction(b.id, "suspend")}
                        disabled={actionLoading === b.id + "suspend"}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        Suspend
                      </button>
                    )}
                    {b.status === "suspended" && (
                      <button
                        onClick={() => doAction(b.id, "reactivate")}
                        disabled={actionLoading === b.id + "reactivate"}
                        className="text-xs text-growth-400 hover:text-growth-300 disabled:opacity-50"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
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
