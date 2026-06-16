"use client"
import { useState } from "react"
import { StaffTopbar } from "@/components/staff/staff-topbar"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Gift, CheckCircle, Star } from "lucide-react"

const REWARDS = [
  { id: 1, label: "Free blowdry",           points: 500, icon: "✂️" },
  { id: 2, label: "₹200 off next visit",    points: 300, icon: "🎁" },
  { id: 3, label: "Free eyebrow threading", points: 150, icon: "✨" },
]
const CUSTOMER = { name: "Aditi Sharma", tier: "Gold", points: 1420, nextTier: "Platinum", pointsToNext: 580 }

export default function StaffLoyaltyPage() {
  const [query, setQuery]       = useState("")
  const [redeemed, setRedeemed] = useState<number | null>(null)
  const found = query.trim().length >= 3

  const handleRedeem = (id: number) => setRedeemed(id)
  const reset        = () => { setRedeemed(null); setQuery("") }

  const tier = redeemed ? CUSTOMER : null
  const reward = REWARDS.find(r => r.id === redeemed)

  return (
    <div>
      <StaffTopbar title="Loyalty" subtitle="View balance and redeem rewards" alertCount={2} />
      <div className="p-6 max-w-md space-y-5">

        {/* Search */}
        <Input theme="light" placeholder="Search customer…" value={query}
          onChange={e => setQuery(e.target.value)} icon={<Search size={15} />} autoFocus />

        {/* Customer card */}
        {found && !redeemed && (
          <>
            <DashCard className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-trust-100 flex items-center justify-center font-bold text-trust-700">
                  {CUSTOMER.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">{CUSTOMER.name}</p>
                    <Badge color="amber" variant="subtle">{CUSTOMER.tier}</Badge>
                  </div>
                  <p className="text-lg font-bold text-trust-600 mt-0.5">{CUSTOMER.points.toLocaleString()} <span className="text-xs font-normal text-gray-400">points</span></p>
                </div>
              </div>

              {/* Progress to next tier */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Progress to {CUSTOMER.nextTier}</span>
                  <span>{CUSTOMER.pointsToNext} pts away</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                    style={{ width: `${(CUSTOMER.points / (CUSTOMER.points + CUSTOMER.pointsToNext)) * 100}%` }} />
                </div>
              </div>
            </DashCard>

            <DashCard>
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-4 h-4 text-trust-500" />
                <h2 className="text-sm font-semibold text-gray-800">Available rewards</h2>
              </div>
              <div className="space-y-2.5">
                {REWARDS.map(r => {
                  const canRedeem = CUSTOMER.points >= r.points
                  return (
                    <div key={r.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${canRedeem ? "border-gray-200 hover:border-trust-300 hover:bg-trust-50/30" : "border-gray-100 opacity-50"}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{r.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{r.label}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Star size={9} className="text-amber-400 fill-amber-400" /> {r.points} points
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant={canRedeem ? "secondary" : "ghost"}
                        disabled={!canRedeem} onClick={() => handleRedeem(r.id)}
                        className="text-xs rounded-lg">
                        Redeem
                      </Button>
                    </div>
                  )
                })}
              </div>
            </DashCard>
          </>
        )}

        {/* Success state */}
        {redeemed && reward && (
          <DashCard className="text-center py-10 space-y-3">
            <div className="w-16 h-16 rounded-full bg-growth-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-growth-600" />
            </div>
            <p className="text-3xl">{reward.icon}</p>
            <h2 className="text-base font-bold text-gray-900">Redeemed!</h2>
            <p className="text-sm text-gray-600">{reward.label}</p>
            <p className="text-xs text-gray-400">−{reward.points} points · New balance: {(CUSTOMER.points - reward.points).toLocaleString()} pts</p>
            <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg mt-2" onClick={reset}>Done</Button>
          </DashCard>
        )}
      </div>
    </div>
  )
}
