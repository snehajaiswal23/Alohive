"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, RefreshCw } from "lucide-react"

type Template = {
  id: string
  name: string
  category: string
  language: string
  body: string
  status: string
  businessId: string
  business: { name: string }
}

const statusColor: Record<string, "green" | "amber" | "red" | "gray"> = {
  approved: "green", pending: "amber", rejected: "red", draft: "gray",
}

export default function WATemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    const params = filter !== "all" ? `?status=${filter}` : ""
    fetch(`/api/admin/wa-templates${params}`)
      .then((r) => r.json())
      .then((d) => { setTemplates(Array.isArray(d) ? d : []); setLoading(false) })
  }, [filter])

  const displayed = templates

  return (
    <div className="p-6 space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-text-primary">WhatsApp templates <span className="text-text-tertiary text-sm font-normal ml-1">({displayed.length})</span></h1>
      </div>

      <div className="flex gap-2">
        {["all", "approved", "pending", "rejected", "draft"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full capitalize transition-colors ${filter === s ? "bg-purple-600 text-white" : "bg-white/5 text-text-secondary hover:text-text-primary"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-text-tertiary text-sm">Loading…</p>
      ) : displayed.length === 0 ? (
        <p className="text-text-tertiary text-sm">No templates found</p>
      ) : (
        <div className="space-y-4">
          {displayed.map((t) => (
            <Card key={t.id} glass>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-growth-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-growth-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-mono text-sm text-text-primary">{t.name}</p>
                      <Badge color={t.category === "Utility" ? "blue" : "teal"} variant="subtle">{t.category}</Badge>
                      <Badge color={statusColor[t.status] ?? "gray"} variant="subtle">{t.status}</Badge>
                      <span className="text-[10px] text-text-tertiary">{t.business.name}</span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{t.body}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {t.status === "pending" && (
                    <Button variant="outline" size="sm" className="border-white/10 text-xs gap-1.5">
                      <RefreshCw size={12} /> Sync status
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
