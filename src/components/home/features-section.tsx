import { Star, RotateCcw, Gift, Sparkles, BarChart2, TrendingUp } from "lucide-react"

const features = [
  {
    icon: Star,
    color: "text-clarity-400",
    bg: "bg-clarity-900/30",
    title: "Google Review Growth",
    desc: "Route happy customers to Google automatically. Unhappy feedback is captured privately before it becomes a public complaint.",
  },
  {
    icon: RotateCcw,
    color: "text-trust-400",
    bg: "bg-trust-900/30",
    title: "Win-back Campaigns",
    desc: "Auto-detect customers who haven't returned in 30/60/90 days and send personalised WhatsApp nudges with offers.",
  },
  {
    icon: Gift,
    color: "text-growth-400",
    bg: "bg-growth-900/30",
    title: "Loyalty & Referral Engine",
    desc: "Points for every visit, review, or referral. Bronze to Platinum tiers. Redemptions handled at checkout in seconds.",
  },
  {
    icon: Sparkles,
    color: "text-clarity-400",
    bg: "bg-clarity-900/30",
    title: "AI Marketing Studio",
    desc: "Describe your offer, AI generates ready-to-send WhatsApp copy, Instagram captions, and poster text — in your brand voice.",
  },
  {
    icon: BarChart2,
    color: "text-trust-400",
    bg: "bg-trust-900/30",
    title: "Industry Dashboards",
    desc: "Salon, cafe, gym, or clinic — each dashboard surfaces the metrics that matter most for your business type.",
  },
  {
    icon: TrendingUp,
    color: "text-growth-400",
    bg: "bg-growth-900/30",
    title: "Competitor Intelligence",
    desc: "Track how your Google rating, review count, and growth compare to nearby competitors — and spot gaps to exploit.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-deep-navy py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-clarity-400 mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Everything a local business needs to grow
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            One platform replacing five tools — WhatsApp marketing, review management, loyalty, analytics, and competitor tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f) => (
            <div key={f.title} className="glass-card rounded-[12px] p-6 hover:border-white/10 transition-colors duration-300 group">
              <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
