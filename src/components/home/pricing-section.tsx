import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "₹999",
    period: "/mo",
    desc: "Perfect for single-location businesses just getting started.",
    features: [
      "Up to 200 customers/month",
      "WhatsApp review requests",
      "Basic loyalty program",
      "Google review monitoring",
      "1 staff account",
      "Email support",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹2,499",
    period: "/mo",
    desc: "For growing businesses that want automation and insights.",
    features: [
      "Up to 1,000 customers/month",
      "Win-back campaigns",
      "Loyalty + referral engine",
      "AI marketing studio",
      "Competitor tracking",
      "5 staff accounts",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Pro",
    price: "₹4,999",
    period: "/mo",
    desc: "For multi-location businesses and high-volume operations.",
    features: [
      "Unlimited customers",
      "Everything in Growth",
      "Multi-location dashboard",
      "Custom WhatsApp templates",
      "AI assistant",
      "Unlimited staff accounts",
      "Custom integrations",
      "Dedicated account manager",
    ],
    cta: "Contact sales",
    highlight: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="bg-deep-navy py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-growth-400 mb-3">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Start free, scale as you grow
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            14-day free trial on all plans. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[12px] p-7 flex flex-col gap-6 relative ${
                plan.highlight
                  ? "bg-growth-900/20 border-2 border-growth-500 glow-green"
                  : "glass-card"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-growth-500 text-white text-xs font-semibold px-3 py-1 rounded-full glow-green-btn">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-text-primary mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-0.5 mb-2">
                  <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                  <span className="text-text-secondary text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-text-secondary">{plan.desc}</p>
              </div>

              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <Check className="w-4 h-4 text-clarity-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/login">
                <Button
                  variant={plan.highlight ? "primary" : "outline"}
                  glow={plan.highlight}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
