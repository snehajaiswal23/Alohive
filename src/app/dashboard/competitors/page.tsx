import { Topbar } from "@/components/dashboard/topbar"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Plus, Star } from "lucide-react"

const competitors = [
  { name: "Bounce Salon", locality: "Koramangala 5th Block", rating: 4.3, reviews: 98, growth: -2 },
  { name: "Toni & Guy", locality: "Indiranagar", rating: 4.6, reviews: 210, growth: 5 },
  { name: "Naturals", locality: "HSR Layout", rating: 4.4, reviews: 156, growth: 3 },
]

const yours = { name: "Gloss Studio", rating: 4.7, reviews: 142, growth: 14 }

export default function CompetitorsPage() {
  return (
    <div>
      <Topbar title="Competitors" subtitle="Track how you compare to nearby businesses" />
      <div className="p-6 space-y-6">
        {/* Your position highlight */}
        <div className="bg-growth-50 border border-growth-200 rounded-[12px] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-growth-700 uppercase tracking-wide mb-1">Your business</p>
            <p className="text-lg font-bold text-gray-900">{yours.name}</p>
            <p className="text-sm text-gray-600 mt-1">{yours.rating} ★ · {yours.reviews} reviews · <span className="text-growth-600 font-medium">+{yours.growth} reviews this month</span></p>
          </div>
          <div className="text-4xl font-black text-growth-600">#1</div>
        </div>

        {/* Competitor table */}
        <DashCard>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-sm font-semibold text-gray-800">Nearby competitors</h2>
            <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg text-xs">
              <Plus size={12} /> Add competitor
            </Button>
          </div>
          <div className="space-y-4">
            {competitors.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-[10px] border border-gray-100 hover:border-gray-200 transition-colors">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.locality}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-gray-800">{c.rating} ★</p>
                    <p className="text-xs text-gray-400">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800">{c.reviews}</p>
                    <p className="text-xs text-gray-400">Reviews</p>
                  </div>
                  <div className="text-center">
                    {c.growth > 0 ? (
                      <p className="font-bold text-growth-600 flex items-center gap-1">
                        <TrendingUp size={13} /> +{c.growth}
                      </p>
                    ) : (
                      <p className="font-bold text-red-500 flex items-center gap-1">
                        <TrendingDown size={13} /> {c.growth}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">This month</p>
                  </div>
                  <div>
                    {c.rating < yours.rating ? (
                      <Badge color="green" variant="subtle">You&apos;re ahead</Badge>
                    ) : (
                      <Badge color="amber" variant="subtle">Catching up</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashCard>

        {/* Opportunity alert */}
        <DashCard className="bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-trust-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-trust-800 text-sm mb-1">Opportunity: Toni & Guy has 5× more reviews but similar rating</p>
              <p className="text-xs text-trust-600">They have 210 reviews vs your 142. Getting 15 more reviews this month would close the gap significantly. We&apos;ll send review nudges to your most recent happy customers.</p>
              <button className="text-xs font-medium text-trust-700 hover:text-trust-900 mt-2">Launch review campaign →</button>
            </div>
          </div>
        </DashCard>
      </div>
    </div>
  )
}
