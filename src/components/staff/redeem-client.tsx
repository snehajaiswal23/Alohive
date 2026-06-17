"use client"
import { useEffect, useState } from "react"
import { StaffTopbar } from "@/components/staff/staff-topbar"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Gift, CheckCircle, Star } from "lucide-react"

interface Reward {
  id: string
  label: string
  points: number
}

interface FoundCustomer {
  id: string
  name: string
  phone: string
  loyaltyPoints: number
  loyaltyTier: string
}

interface RedeemClientProps {
  businessId: string
  rewards: Reward[]
}

function tierColor(tier: string) {
  if (tier === "Platinum" || tier === "Gold") return "blue" as const
  if (tier === "Silver") return "gray" as const
  return "amber" as const
}

export function RedeemClient({ businessId, rewards }: RedeemClientProps) {
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<FoundCustomer[]>([])
  const [customer, setCustomer] = useState<FoundCustomer | null>(null)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<{ reward: Reward; newBalance: number } | null>(null)

  useEffect(() => {
    if (customer || query.trim().length < 3) {
      setResults([])
      return
    }
    let cancelled = false
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/business/${businessId}/customers?q=${encodeURIComponent(query.trim())}&pageSize=5`)
        const data = await res.json()
        if (!cancelled) setResults(data.customers ?? [])
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, 400)
    return () => { cancelled = true; clearTimeout(t) }
  }, [query, customer, businessId])

  async function handleRedeem(reward: Reward) {
    if (!customer) return
    setRedeeming(reward.id)
    setError("")
    try {
      const res = await fetch(`/api/business/${businessId}/loyalty/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, rewardId: reward.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      setSuccess({ reward, newBalance: data.newBalance })
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setRedeeming(null)
    }
  }

  function reset() {
    setQuery("")
    setResults([])
    setCustomer(null)
    setError("")
    setSuccess(null)
  }

  return (
    <div>
      <StaffTopbar title="Loyalty" subtitle="View balance and redeem rewards" />
      <div className="p-6 max-w-md space-y-5">
        {!customer && !success && (
          <>
            <Input
              theme="light"
              placeholder="Search customer by name or phone…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<Search size={15} />}
              autoFocus
            />
            {searching && <p className="text-xs text-gray-400">Searching…</p>}
            {!searching && query.trim().length >= 3 && results.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">No matching customers</p>
            )}
            {results.length > 0 && (
              <div className="space-y-2">
                {results.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCustomer(c)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-trust-300 hover:bg-trust-50/30 transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-trust-100 flex items-center justify-center font-bold text-trust-700 shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                        <Badge color={tierColor(c.loyaltyTier)} variant="subtle">{c.loyaltyTier}</Badge>
                      </div>
                      <p className="text-xs text-gray-400">{c.phone} · {c.loyaltyPoints.toLocaleString()} pts</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {customer && !success && (
          <>
            <DashCard className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-trust-100 flex items-center justify-center font-bold text-trust-700">
                  {customer.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">{customer.name}</p>
                    <Badge color={tierColor(customer.loyaltyTier)} variant="subtle">{customer.loyaltyTier}</Badge>
                  </div>
                  <p className="text-lg font-bold text-trust-600 mt-0.5">
                    {customer.loyaltyPoints.toLocaleString()} <span className="text-xs font-normal text-gray-400">points</span>
                  </p>
                </div>
              </div>
            </DashCard>

            <DashCard>
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-4 h-4 text-trust-500" />
                <h2 className="text-sm font-semibold text-gray-800">Available rewards</h2>
              </div>
              <div className="space-y-2.5">
                {rewards.map((r) => {
                  const canRedeem = customer.loyaltyPoints >= r.points
                  return (
                    <div
                      key={r.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${canRedeem ? "border-gray-200 hover:border-trust-300 hover:bg-trust-50/30" : "border-gray-100 opacity-50"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🎁</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{r.label}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Star size={9} className="text-amber-400 fill-amber-400" /> {r.points} points
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={canRedeem ? "secondary" : "ghost"}
                        disabled={!canRedeem || redeeming !== null}
                        onClick={() => handleRedeem(r)}
                        className="text-xs rounded-lg"
                      >
                        {redeeming === r.id ? "Redeeming…" : "Redeem"}
                      </Button>
                    </div>
                  )
                })}
              </div>
              {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
              <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg mt-4 w-full" onClick={reset}>
                ← Search another customer
              </Button>
            </DashCard>
          </>
        )}

        {success && (
          <DashCard className="text-center py-10 space-y-3">
            <div className="w-16 h-16 rounded-full bg-growth-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-growth-600" />
            </div>
            <p className="text-3xl">🎁</p>
            <h2 className="text-base font-bold text-gray-900">Redeemed!</h2>
            <p className="text-sm text-gray-600">{success.reward.label}</p>
            <p className="text-xs text-gray-400">
              −{success.reward.points} points · New balance: {success.newBalance.toLocaleString()} pts
            </p>
            <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg mt-2" onClick={reset}>
              Done
            </Button>
          </DashCard>
        )}
      </div>
    </div>
  )
}
