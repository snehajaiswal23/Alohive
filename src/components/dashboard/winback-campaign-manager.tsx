"use client"
import { Fragment, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, BarChart3 } from "lucide-react"

interface CampaignRow {
  id: string
  name: string
  triggerDays: number | null
  status: string
  sentCount: number
  replyCount: number
  recoveredCount: number
}

interface CampaignStats {
  sentCount: number
  failedCount: number
  openCount: number
  openRate: number | null
  replyCount: number
  replyRate: number | null
  recoveredCount: number
  recoveredRate: number | null
  revenueRecovered: number | null
  revenueSampleSize: number
}

function formatPct(rate: number | null) {
  return rate == null ? "—" : `${Math.round(rate * 100)}%`
}

interface WinbackCampaignManagerProps {
  businessId: string
  initialCampaigns: CampaignRow[]
}

const statusColor = { active: "green", paused: "amber" } as const

export function WinbackCampaignManager({ businessId, initialCampaigns }: WinbackCampaignManagerProps) {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [triggerDays, setTriggerDays] = useState(30)
  const [offer, setOffer] = useState("")
  const [messageTemplate, setMessageTemplate] = useState("Hey {{name}}, we miss you at {{business}}! {{offer}} Come visit us soon.")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statsById, setStatsById] = useState<Record<string, CampaignStats>>({})
  const [statsLoadingId, setStatsLoadingId] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/business/${businessId}/winback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, triggerDays, messageTemplate, offer }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      setCampaigns([data.campaign, ...campaigns])
      setShowForm(false)
      setName("")
      setOffer("")
      setMessageTemplate("Hey {{name}}, we miss you at {{business}}! {{offer}} Come visit us soon.")
      setTriggerDays(30)
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(campaign: CampaignRow) {
    const nextStatus = campaign.status === "active" ? "paused" : "active"
    setTogglingId(campaign.id)
    try {
      const res = await fetch(`/api/business/${businessId}/winback/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) return
      const data = await res.json()
      setCampaigns(campaigns.map((c) => (c.id === campaign.id ? data.campaign : c)))
    } finally {
      setTogglingId(null)
    }
  }

  async function toggleStats(campaign: CampaignRow) {
    if (expandedId === campaign.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(campaign.id)
    if (statsById[campaign.id]) return
    setStatsLoadingId(campaign.id)
    try {
      const res = await fetch(`/api/business/${businessId}/winback/${campaign.id}/stats`)
      if (!res.ok) return
      const data = await res.json()
      setStatsById((prev) => ({ ...prev, [campaign.id]: data.stats }))
    } finally {
      setStatsLoadingId(null)
    }
  }

  return (
    <>
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ New campaign"}
        </Button>
      </div>

      <DashCard className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Win-back campaigns</h2>
        </div>
        {campaigns.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No campaigns yet — create one below</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Campaign", "Trigger", "Status", "Sent", "Replies", "Recovered", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const stats = statsById[c.id]
                return (
                  <Fragment key={c.id}>
                    <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 font-medium text-gray-800">{c.name}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{c.triggerDays} days inactive</td>
                      <td className="px-5 py-3.5">
                        <Badge color={statusColor[c.status as keyof typeof statusColor] ?? "gray"} variant="subtle">{c.status}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">{c.sentCount}</td>
                      <td className="px-5 py-3.5 text-gray-700">{c.replyCount}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-growth-600">{c.recoveredCount}</span>
                      </td>
                      <td className="px-5 py-3.5 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-gray-700 rounded-lg p-1.5"
                          onClick={() => toggleStats(c)}
                        >
                          <BarChart3 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-gray-700 rounded-lg p-1.5"
                          onClick={() => toggleStatus(c)}
                          disabled={togglingId === c.id}
                        >
                          {c.status === "active" ? <Pause size={14} /> : <Play size={14} />}
                        </Button>
                      </td>
                    </tr>
                    {expandedId === c.id && (
                      <tr className="border-b border-gray-50 bg-gray-50/60">
                        <td colSpan={7} className="px-5 py-4">
                          {statsLoadingId === c.id ? (
                            <p className="text-xs text-gray-400">Loading stats…</p>
                          ) : stats ? (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-400">Sent / Failed</p>
                                <p className="font-medium text-gray-800">{stats.sentCount} / {stats.failedCount}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Open rate</p>
                                <p className="font-medium text-gray-800">{formatPct(stats.openRate)} <span className="text-gray-400 text-xs">({stats.openCount})</span></p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Reply rate</p>
                                <p className="font-medium text-gray-800">{formatPct(stats.replyRate)} <span className="text-gray-400 text-xs">({stats.replyCount})</span></p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Recovered (14d)</p>
                                <p className="font-medium text-growth-600">{formatPct(stats.recoveredRate)} <span className="text-gray-400 text-xs">({stats.recoveredCount})</span></p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Revenue recovered</p>
                                <p className="font-medium text-gray-800">
                                  {stats.revenueRecovered != null ? `₹${stats.revenueRecovered.toLocaleString("en-IN")}` : "No bill data"}
                                </p>
                                {stats.revenueRecovered != null && (
                                  <p className="text-xs text-gray-400">from {stats.revenueSampleSize} visit{stats.revenueSampleSize === 1 ? "" : "s"}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">No stats available</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </DashCard>

      {showForm && (
        <DashCard>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Create new campaign</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input theme="light" label="Campaign name" placeholder="e.g. 30-day nudge" value={name} onChange={(e) => setName(e.target.value)} required />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Trigger (days inactive)</label>
                <select
                  value={triggerDays}
                  onChange={(e) => setTriggerDays(Number(e.target.value))}
                  className="w-full rounded-[8px] px-3 py-2.5 text-sm border border-gray-200 focus:border-clarity-500 focus:ring-1 focus:ring-clarity-500/20 outline-none transition-all"
                >
                  <option value={30}>30 days inactive</option>
                  <option value={60}>60 days inactive</option>
                  <option value={90}>90 days inactive</option>
                </select>
              </div>
              <Input theme="light" label="Offer" placeholder="e.g. 20% off your next visit" value={offer} onChange={(e) => setOffer(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Message template <span className="text-gray-400 font-normal">— use {"{{name}}"}, {"{{business}}"}, {"{{offer}}"}</span>
              </label>
              <textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows={3}
                className="w-full rounded-[8px] px-3 py-2.5 text-sm border border-gray-200 focus:border-clarity-500 focus:ring-1 focus:ring-clarity-500/20 outline-none transition-all"
                required
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm" disabled={saving}>
                {saving ? "Saving…" : "Save campaign"}
              </Button>
            </div>
          </form>
        </DashCard>
      )}
    </>
  )
}
