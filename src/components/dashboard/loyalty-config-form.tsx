"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashCard } from "@/components/ui/card"

interface TierThresholds {
  Silver: number
  Gold: number
  Platinum: number
}

interface LoyaltyConfigState {
  pointsPerVisit: number
  pointsPerReview: number
  pointsPerReferral: number
  tierThresholds: TierThresholds
}

interface LoyaltyConfigFormProps {
  businessId: string
  initialConfig: LoyaltyConfigState
}

export function LoyaltyConfigForm({ businessId, initialConfig }: LoyaltyConfigFormProps) {
  const [config, setConfig] = useState(initialConfig)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/business/${businessId}/loyalty/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      setConfig(data)
      setEditing(false)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <DashCard>
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Program settings</h2>
        <div className="space-y-3">
          {[
            { label: "Points per visit", value: `${config.pointsPerVisit} pts` },
            { label: "Points per Google review", value: `${config.pointsPerReview} pts` },
            { label: "Points per referral", value: `${config.pointsPerReferral} pts` },
            { label: "Silver tier from", value: `${config.tierThresholds.Silver} pts` },
            { label: "Gold tier from", value: `${config.tierThresholds.Gold} pts` },
            { label: "Platinum tier from", value: `${config.tierThresholds.Platinum} pts` },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-600">{row.label}</span>
              <span className="font-medium text-gray-800">{row.value}</span>
            </div>
          ))}
          <button
            onClick={() => setEditing(true)}
            className="w-full mt-2 text-sm text-clarity-600 font-medium hover:text-clarity-700 py-2"
          >
            Edit settings →
          </button>
        </div>
      </DashCard>
    )
  }

  return (
    <DashCard>
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Program settings</h2>
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          <Input
            theme="light"
            label="Per visit"
            type="number"
            min={0}
            value={config.pointsPerVisit}
            onChange={(e) => setConfig({ ...config, pointsPerVisit: Number(e.target.value) })}
            required
          />
          <Input
            theme="light"
            label="Per review"
            type="number"
            min={0}
            value={config.pointsPerReview}
            onChange={(e) => setConfig({ ...config, pointsPerReview: Number(e.target.value) })}
            required
          />
          <Input
            theme="light"
            label="Per referral"
            type="number"
            min={0}
            value={config.pointsPerReferral}
            onChange={(e) => setConfig({ ...config, pointsPerReferral: Number(e.target.value) })}
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Input
            theme="light"
            label="Silver from"
            type="number"
            min={0}
            value={config.tierThresholds.Silver}
            onChange={(e) => setConfig({ ...config, tierThresholds: { ...config.tierThresholds, Silver: Number(e.target.value) } })}
            required
          />
          <Input
            theme="light"
            label="Gold from"
            type="number"
            min={0}
            value={config.tierThresholds.Gold}
            onChange={(e) => setConfig({ ...config, tierThresholds: { ...config.tierThresholds, Gold: Number(e.target.value) } })}
            required
          />
          <Input
            theme="light"
            label="Platinum from"
            type="number"
            min={0}
            value={config.tierThresholds.Platinum}
            onChange={(e) => setConfig({ ...config, tierThresholds: { ...config.tierThresholds, Platinum: Number(e.target.value) } })}
            required
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-700 rounded-lg"
            onClick={() => {
              setConfig(initialConfig)
              setEditing(false)
              setError("")
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </DashCard>
  )
}
