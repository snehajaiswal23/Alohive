import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronDown, Star, RotateCcw, MessageCircle, TrendingUp } from "lucide-react"

// Mini mock-dashboard card shown beside the headline
function ProductPreview() {
  return (
    <div className="relative w-full max-w-md">
      {/* Outer glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-clarity-500/30 via-transparent to-growth-500/20 blur-sm" />
      <div className="relative glass-card rounded-2xl p-5 border border-white/10 shadow-2xl">
        {/* Topbar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-text-primary">Today&apos;s snapshot</span>
          <span className="text-xs text-growth-400 font-medium">● Live</span>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon: Star,          label: "New reviews",   value: "+12",  color: "text-clarity-400",  bg: "bg-clarity-900/40" },
            { icon: RotateCcw,     label: "Customers back", value: "23",   color: "text-growth-400",   bg: "bg-growth-900/40"  },
            { icon: TrendingUp,    label: "Revenue",        value: "↑18%", color: "text-trust-400",    bg: "bg-trust-900/40"   },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="rounded-xl p-3 bg-white/3 border border-white/6 text-center">
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mx-auto mb-1.5`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <p className={`text-base font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-text-tertiary leading-tight mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="space-y-2">
          {[
            { msg: "Priya left a ★★★★★ Google review", time: "2m ago",  dot: "bg-clarity-400" },
            { msg: "Win-back sent to 8 inactive customers", time: "14m ago", dot: "bg-growth-400" },
            { msg: "Rohan earned 50 loyalty points",     time: "31m ago", dot: "bg-trust-400"   },
          ].map(({ msg, time, dot }) => (
            <div key={msg} className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-white/2 border border-white/4">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
              <p className="text-[11px] text-text-secondary flex-1 leading-snug">{msg}</p>
              <span className="text-[10px] text-text-tertiary shrink-0">{time}</span>
            </div>
          ))}
        </div>

        {/* WhatsApp badge */}
        <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-growth-900/30 border border-growth-500/20">
          <MessageCircle className="w-3.5 h-3.5 text-growth-400 shrink-0" />
          <span className="text-[11px] text-growth-300">3 WhatsApp campaigns sent today · 68% reply rate</span>
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 pt-24 pb-0">
      {/* Content */}
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — copy */}
          <div className="text-center lg:text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-clarity-500/40 text-clarity-400 text-xs font-medium mb-7 bg-clarity-900/20">
              <span className="w-1.5 h-1.5 rounded-full bg-clarity-400 animate-pulse" />
              WhatsApp-first growth platform
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-6xl xl:text-7xl font-bold text-text-primary leading-[1.06] tracking-tight mb-6">
              Turn every visit{" "}
              <br className="hidden sm:block" />
              into a customer{" "}
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-clarity-400 via-growth-400 to-trust-400">
                who stays
              </span>
            </h1>

            {/* Sub-copy */}
            <p className="text-lg text-text-secondary max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              Alohive automates reviews, loyalty, and win-back campaigns over
              WhatsApp — so your salon, cafe, or gym grows without a marketing team.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <Link href="/login">
                <Button variant="primary" size="lg" glow className="font-semibold w-full sm:w-auto">
                  Start free trial
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  See how it works
                </Button>
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-5 gap-y-2 text-[13px] text-text-tertiary">
              {[
                "No credit card required",
                "Setup in 10 minutes",
                "Works on any phone",
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="w-0.5 h-3.5 bg-white/10 hidden sm:block" />}
                  <span className="w-1.5 h-1.5 rounded-full bg-clarity-500/70" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right — product preview */}
          <div className="flex justify-center lg:justify-end">
            <ProductPreview />
          </div>
        </div>
      </div>

      {/* Bottom gradient — blends shader into the solid stats bar */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-deep-navy" />

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-tertiary animate-bounce z-10">
        <ChevronDown size={18} />
      </div>
    </section>
  )
}
