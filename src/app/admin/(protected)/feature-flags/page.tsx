"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Flag = {
  id: string
  key: string
  label: string
  description: string | null
  enabledFor: string
  isEnabled: boolean
  updatedAt: string
  updatedBy: string | null
}

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={cn("w-10 h-5 rounded-full transition-colors relative disabled:opacity-50", on ? "bg-growth-500" : "bg-slate-700")}
    >
      <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform", on ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  )
}

const scopeColor: Record<string, "green" | "teal" | "purple" | "gray"> = {
  all: "green", growth_pro: "teal", pro_only: "purple", none: "gray",
}

const scopeLabel: Record<string, string> = {
  all: "All plans", growth_pro: "Growth+", pro_only: "Pro only", none: "Disabled",
}

export default function FeatureFlags() {
  const [flags, setFlags] = useState<Flag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/feature-flags")
      .then((r) => r.json())
      .then((d) => { setFlags(d); setLoading(false) })
  }, [])

  const toggle = async (flag: Flag) => {
    setSaving(flag.key)
    const newVal = !flag.isEnabled
    setFlags((f) => f.map((x) => (x.key === flag.key ? { ...x, isEnabled: newVal } : x)))
    await fetch("/api/admin/feature-flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: flag.key, isEnabled: newVal }),
    })
    setSaving(null)
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Feature flags</h1>
        <p className="text-sm text-text-secondary mt-0.5">Changes persist to database and apply immediately across all instances.</p>
      </div>

      {loading ? (
        <p className="text-text-tertiary text-sm">Loading…</p>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => (
            <Card key={flag.key} glass className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-sm font-medium text-text-primary">{flag.label}</p>
                  <Badge color={scopeColor[flag.enabledFor] ?? "gray"} variant="subtle">
                    {scopeLabel[flag.enabledFor] ?? flag.enabledFor}
                  </Badge>
                  {!flag.isEnabled && <Badge color="red" variant="subtle">Kill switch ON</Badge>}
                </div>
                {flag.description && <p className="text-xs text-text-tertiary">{flag.description}</p>}
                {flag.updatedBy && (
                  <p className="text-[10px] text-text-tertiary mt-1">
                    Last changed by {flag.updatedBy} · {new Date(flag.updatedAt).toLocaleDateString("en-IN")}
                  </p>
                )}
              </div>
              <Toggle on={flag.isEnabled} onChange={() => toggle(flag)} disabled={saving === flag.key} />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
