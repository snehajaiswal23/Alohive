"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    monthly: 999,
    annual: 799,
    desc: "Perfect for single-location businesses just getting started.",
    features: [
      "Up to 200 customers / month",
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
    monthly: 2499,
    annual: 1999,
    desc: "For growing businesses that want automation and deeper insights.",
    features: [
      "Up to 1,000 customers / month",
      "Win-back campaigns",
      "Loyalty + referral engine",
      "AI marketing studio",
      "Competitor tracking",
      "Analytics dashboard",
      "5 staff accounts",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Pro",
    monthly: 4999,
    annual: 3999,
    desc: "For multi-location businesses and high-volume operations.",
    features: [
      "Unlimited customers",
      "Everything in Growth",
      "Multi-location dashboard",
      "Custom WhatsApp templates",
      "AI assistant (ask anything)",
      "Unlimited staff accounts",
      "Custom integrations",
      "Dedicated account manager",
    ],
    cta: "Contact sales",
    highlight: false,
  },
]

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`
}

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="bg-deep-navy py-28 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-growth-400 mb-3">Pricing</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Start free, scale as you grow
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto mb-8">
            14-day free trial on all plans. No credit card required.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-white/4 border border-white/8 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                !annual ? "bg-white/10 text-text-primary" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                annual ? "bg-growth-500/20 text-growth-400" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Annual
              <span className="text-[10px] font-bold bg-growth-500/30 text-growth-400 px-1.5 py-0.5 rounded-full">
                −20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => {
            const price = annual ? plan.annual : plan.monthly
            return (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 flex flex-col gap-6 relative transition-all duration-300 ${
                  plan.highlight
                    ? "bg-growth-900/20 border-2 border-growth-500/60 glow-green"
                    : "glass-card hover:border-white/10"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-growth-500 text-white text-[11px] font-bold px-3 py-1 rounded-full glow-green-btn tracking-wide">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan info */}
                <div>
                  <h3 className="text-lg font-display font-bold text-text-primary mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold text-text-primary tabular-nums">{fmt(price)}</span>
                    <span className="text-text-secondary text-sm">/mo</span>
                  </div>
                  {annual && (
                    <p className="text-xs text-growth-400 mb-2">
                      Billed annually ({fmt(price * 12)}/yr)
                    </p>
                  )}
                  <p className="text-sm text-text-secondary">{plan.desc}</p>
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-text-secondary">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? "text-growth-400" : "text-clarity-400"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="/login">
                  <Button
                    variant={plan.highlight ? "primary" : "outline"}
                    glow={plan.highlight}
                    className="w-full font-semibold"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-text-tertiary mt-8">
          All prices in INR · GST applicable · Cancel anytime · Switch plans at any time
        </p>
      </div>
    </section>
  )
}
