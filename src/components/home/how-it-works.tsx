import { MessageCircle, Star, Gift, RotateCcw, BarChart2, Zap } from "lucide-react"

const steps = [
  {
    icon: Zap,
    n: 1,
    title: "Customer visits",
    desc: "A walk-in, appointment, or delivery — any touchpoint triggers the flow. Your receptionist logs the visit in seconds.",
    color: "text-clarity-400",
    bg: "bg-clarity-900/40",
    border: "border-clarity-500/20",
  },
  {
    icon: MessageCircle,
    n: 2,
    title: "WhatsApp message sent",
    desc: "30 minutes after checkout a warm, branded message lands on their phone. No app install. No friction.",
    color: "text-trust-400",
    bg: "bg-trust-900/40",
    border: "border-trust-500/20",
  },
  {
    icon: Star,
    n: 3,
    title: "Feedback routed smartly",
    desc: "Happy customers get a Google review link. Unhappy feedback is captured privately before it becomes a public complaint.",
    color: "text-clarity-400",
    bg: "bg-clarity-900/40",
    border: "border-clarity-500/20",
  },
  {
    icon: Gift,
    n: 4,
    title: "Loyalty points auto-credited",
    desc: "Points for every visit, review, or referral. Bronze to Platinum tiers with redeemable rewards. Zero app needed.",
    color: "text-growth-400",
    bg: "bg-growth-900/40",
    border: "border-growth-500/20",
  },
  {
    icon: RotateCcw,
    n: 5,
    title: "AI brings them back",
    desc: "Win-back campaigns fire automatically when customers go quiet for 30, 60, or 90 days — with personalised offers.",
    color: "text-trust-400",
    bg: "bg-trust-900/40",
    border: "border-trust-500/20",
  },
  {
    icon: BarChart2,
    n: 6,
    title: "Everything in one dashboard",
    desc: "Reviews, visits, loyalty, revenue, campaigns — one clean view. Know exactly what's working, in real time.",
    color: "text-growth-400",
    bg: "bg-growth-900/40",
    border: "border-growth-500/20",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-obsidian py-28 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-clarity-400 mb-3">How it works</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Set up once. Grows forever.
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto leading-relaxed">
            Alohive runs your entire post-visit customer engine automatically
            — while you focus on serving the next customer.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((step) => (
            <div
              key={step.n}
              className={`group glass-card rounded-2xl p-6 hover:${step.border} hover:bg-white/4 transition-all duration-300 flex flex-col gap-4`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center shrink-0`}>
                  <step.icon className={`w-4 h-4 ${step.color}`} />
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${step.color} opacity-60`}>
                  Step {step.n}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1.5">{step.title}</h3>
                <p className="text-[13.5px] text-text-secondary leading-relaxed">{step.desc}</p>
              </div>
              {/* Progress line */}
              {step.n < 6 && (
                <div className="mt-auto pt-2">
                  <div className="h-px w-full bg-white/4 relative overflow-hidden">
                    <div className={`absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent ${step.color.replace("text-", "to-").replace("400", "500/30")}`} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom nudge */}
        <p className="text-center text-sm text-text-tertiary mt-10">
          Average business goes live in{" "}
          <span className="text-clarity-400 font-semibold">under 10 minutes</span>
          {" "}— no developer needed.
        </p>
      </div>
    </section>
  )
}
