import { Star, RotateCcw, Gift, Sparkles, BarChart2, TrendingUp } from "lucide-react"

const featured = {
  icon: Sparkles,
  color: "text-clarity-400",
  bg: "bg-clarity-900/30",
  border: "border-clarity-500/20",
  glow: "rgba(45,212,191,0.08)",
  title: "AI Marketing Studio",
  subtitle: "Turn any idea into a campaign in 30 seconds",
  desc: "Describe your offer in plain language. The AI generates ready-to-send WhatsApp copy, Instagram captions, and poster text — perfectly tuned to your brand tone and local festivals like Diwali, Eid, and Navratri.",
  bullets: [
    "Festival & seasonal template library (20+ templates)",
    "WhatsApp · Instagram · SMS — all three formats at once",
    "Tone controls: professional, casual, Hindi-English mix",
    "One-click campaign launcher with audience filters",
  ],
}

const features = [
  {
    icon: Star,
    color: "text-clarity-400",
    bg: "bg-clarity-900/30",
    title: "Google Review Growth",
    desc: "Route happy customers to Google automatically. Unhappy feedback stays private.",
  },
  {
    icon: RotateCcw,
    color: "text-trust-400",
    bg: "bg-trust-900/30",
    title: "Win-back Campaigns",
    desc: "Auto-detect churned customers and send personalised WhatsApp nudges at 30/60/90 days.",
  },
  {
    icon: Gift,
    color: "text-growth-400",
    bg: "bg-growth-900/30",
    title: "Loyalty & Referrals",
    desc: "Points for every visit, review, or referral. Bronze to Platinum tiers. No app needed.",
  },
  {
    icon: BarChart2,
    color: "text-trust-400",
    bg: "bg-trust-900/30",
    title: "Revenue Analytics",
    desc: "CLV, retention rate, campaign ROI, staff performance, and peak-hour heatmaps — all from your data.",
  },
  {
    icon: TrendingUp,
    color: "text-growth-400",
    bg: "bg-growth-900/30",
    title: "Competitor Tracking",
    desc: "See how your Google rating and review count compare to nearby competitors — and close the gap.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-deep-navy py-28 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-clarity-400 mb-3">Features</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
            One platform. Five tools replaced.
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto leading-relaxed">
            WhatsApp marketing · review management · loyalty · analytics · competitor tracking — under one login.
          </p>
        </div>

        {/* Large featured card */}
        <div
          className="glass-card rounded-2xl p-8 md:p-10 mb-5 border border-white/8 relative overflow-hidden"
          style={{ boxShadow: `0 0 80px ${featured.glow}` }}
        >
          {/* Background shimmer */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(45,212,191,0.04) 0%, transparent 70%)" }}
          />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className={`w-11 h-11 rounded-xl ${featured.bg} border ${featured.border} flex items-center justify-center mb-4`}>
                <featured.icon className={`w-5 h-5 ${featured.color}`} />
              </div>
              <p className={`text-xs font-bold uppercase tracking-widest ${featured.color} mb-2`}>{featured.subtitle}</p>
              <h3 className="font-display text-2xl font-bold text-text-primary mb-3">{featured.title}</h3>
              <p className="text-text-secondary leading-relaxed mb-5">{featured.desc}</p>
            </div>
            <ul className="space-y-3">
              {featured.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full ${featured.color.replace("text-", "bg-")} shrink-0`} />
                  <span className="text-sm text-text-secondary">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Secondary features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group glass-card rounded-2xl p-6 hover:border-white/10 hover:bg-white/4 transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">{f.title}</h3>
              <p className="text-[13.5px] text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
