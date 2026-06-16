import { Topbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/ui/stat-card"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, AlertCircle, Sparkles, TrendingUp } from "lucide-react"

const reviews = [
  { name: "Aditi Sharma", rating: 5, text: "Absolutely loved my hair color treatment! Priya is amazing.", date: "2 hours ago", replied: false, platform: "Google" },
  { name: "Ravi Kumar", rating: 4, text: "Great service, friendly staff. Will come back for sure.", date: "Yesterday", replied: true, platform: "Google" },
  { name: "Sunita Patel", rating: 2, text: "Waited 45 minutes even with an appointment. Not ideal.", date: "Yesterday", replied: false, platform: "Internal", unhappy: true },
  { name: "Kiran Desai", rating: 5, text: "Best salon in Koramangala, period!", date: "3 days ago", replied: false, platform: "Google" },
]

export default function ReviewsPage() {
  return (
    <div>
      <Topbar title="Reviews" subtitle="Monitor and respond to customer feedback" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard theme="light" title="Total reviews" value="142" accentColor="blue" icon={<Star size={16} />} />
          <StatCard theme="light" title="Average rating" value="4.7 ★" change="+0.2 vs last month" changePositive accentColor="amber" icon={<TrendingUp size={16} />} />
          <StatCard theme="light" title="This month" value="18" change="+14%" changePositive accentColor="green" icon={<TrendingUp size={16} />} />
          <StatCard theme="light" title="Negative alerts" value="2" change="Need response" accentColor="red" icon={<AlertCircle size={16} />} />
        </div>

        {/* Negative alert */}
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-[12px] px-5 py-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 mb-1">Unhappy customer: Sunita Patel</p>
            <p className="text-xs text-red-600">&ldquo;Waited 45 minutes even with an appointment. Not ideal.&rdquo;</p>
            <p className="text-xs text-red-400 mt-1">Left 2 stars · Yesterday at 3:45 PM</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 flex-wrap">
          {["All", "5 ★", "4 ★", "3 ★", "1-2 ★ (Unhappy)", "Unreplied"].map((f) => (
            <button key={f} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-clarity-400 hover:text-clarity-700 transition-colors">
              {f}
            </button>
          ))}
        </div>

        {/* Review list */}
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <DashCard key={i} className={review.unhappy ? "border-red-200 bg-red-50/30" : ""}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                    {review.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800 text-sm">{review.name}</span>
                      <Badge color={review.unhappy ? "red" : review.platform === "Google" ? "blue" : "gray"} variant="subtle">
                        {review.unhappy ? "Unhappy" : review.platform}
                      </Badge>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} className={`text-sm ${s <= review.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{review.date}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {!review.replied && (
                    <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg text-xs px-3 py-1.5">
                      <Sparkles size={12} className="text-clarity-500" /> AI reply
                    </Button>
                  )}
                  {review.replied && <Badge color="green" variant="subtle">Replied</Badge>}
                </div>
              </div>
            </DashCard>
          ))}
        </div>
      </div>
    </div>
  )
}
