"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Flag = {
  key: string
  label: string
  desc: string
  enabledFor: "all" | "growth_pro" | "pro_only" | "none"
  enabled: boolean
}

const INITIAL_FLAGS: Flag[] = [
  { key: "ai_studio", label: "AI Marketing Studio", desc: "Generate campaign content with AI", enabledFor: "growth_pro", enabled: true },
  { key: "competitors", label: "Competitor tracking", desc: "Track competitor Google ratings", enabledFor: "pro_only", enabled: true },
  { key: "ai_assistant", label: "AI Assistant chat", desc: "Ask business questions to AI", enabledFor: "growth_pro", enabled: true },
  { key: "multi_location", label: "Multi-location dashboard", desc: "Manage multiple branches", enabledFor: "pro_only", enabled: false },
  { key: "advanced_analytics", label: "Advanced analytics", desc: "LTV, campaign ROI, staff perf", enabledFor: "growth_pro", enabled: true },
  { key: "referral_program", label: "Referral engine", desc: "Customer referral tracking", enabledFor: "all", enabled: true },
]

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn("w-10 h-5 rounded-full transition-colors relative", on ? "bg-growth-500" : "bg-slate-700")}
    >
      <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform", on ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  )
}

export default function FeatureFlags() {
  const [flags, setFlags] = useState(INITIAL_FLAGS)

  const toggle = (key: string) =>
    setFlags((f) => f.map((x) => (x.key === key ? { ...x, enabled: !x.enabled } : x)))

  const scopeColor = { all: "green", growth_pro: "teal", pro_only: "purple", none: "gray" } as const

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-xl font-bold text-text-primary">Feature flags</h1>
      <p className="text-sm text-text-secondary">Toggle features globally or per plan. Changes apply immediately.</p>

      <div className="space-y-3">
        {flags.map((flag) => (
          <Card key={flag.key} glass className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-text-primary">{flag.label}</p>
                <Badge color={scopeColor[flag.enabledFor]} variant="subtle">
                  {flag.enabledFor === "all" ? "All plans" : flag.enabledFor === "growth_pro" ? "Growth+" : flag.enabledFor === "pro_only" ? "Pro only" : "Disabled"}
                </Badge>
                {!flag.enabled && <Badge color="red" variant="subtle">Kill switch ON</Badge>}
              </div>
              <p className="text-xs text-text-tertiary">{flag.desc}</p>
            </div>
            <Toggle on={flag.enabled} onChange={() => toggle(flag.key)} />
          </Card>
        ))}
      </div>
    </div>
  )
}
