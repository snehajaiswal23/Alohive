import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Topbar } from "@/components/dashboard/topbar"
import { DashCard } from "@/components/ui/card"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { canAccess, GATED_ROUTES, PLAN_RANK } from "@/lib/plan-access"
import { CheckCircle2, Lock, ArrowRight, Zap } from "lucide-react"

// Plan features shown on the upgrade prompt (client-safe constants, no crypto)
const PLAN_FEATURES: Record<string, { name: string; amountDisplay: string; features: string[] }> = {
  starter: {
    name: "Starter",
    amountDisplay: "₹999",
    features: ["Up to 500 customers", "WhatsApp feedback", "Basic loyalty", "Google review sync"],
  },
  growth: {
    name: "Growth",
    amountDisplay: "₹2,499",
    features: [
      "Up to 2,000 customers",
      "Win-back campaigns",
      "Referral program",
      "Analytics dashboard",
      "Advanced loyalty",
      "Priority support",
    ],
  },
  pro: {
    name: "Pro",
    amountDisplay: "₹4,999",
    features: [
      "Unlimited customers",
      "AI Studio & AI Assistant",
      "Competitor tracking",
      "Multi-branch",
      "White-label reports",
      "Dedicated account manager",
    ],
  },
}

const PLAN_ORDER = ["starter", "growth", "pro"]

interface UpgradePageProps {
  searchParams: Promise<{ required?: string; from?: string }>
}

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
  const { required, from } = await searchParams
  const safeTo = from?.startsWith("/") && !from.startsWith("//") ? from : "/dashboard"

  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const payload = token ? await verifySession(token).catch(() => null) : null
  if (!payload) redirect("/login")

  // Query real plan from DB — middleware may have blocked based on a stale JWT
  const business = await prisma.business.findUnique({
    where: { id: payload.businessId },
    select: { plan: true },
  })
  const realPlan = business?.plan ?? "trial"

  // If the user already has access (stale JWT case), refresh the JWT and send them through
  if (canAccess(realPlan, safeTo)) {
    redirect(`/api/auth/refresh?then=${encodeURIComponent(safeTo)}`)
  }

  const requiredPlan = required && required in PLAN_FEATURES ? required : "growth"
  const requiredRank = PLAN_RANK[requiredPlan] ?? 2
  const currentRank = PLAN_RANK[realPlan] ?? 0

  // The feature they tried to access
  const gatedRoute = GATED_ROUTES.find((r) => safeTo.startsWith(r.prefix))
  const featureLabel = gatedRoute?.label ?? "this feature"

  // Plans at or above the required tier
  const upgradePlans = PLAN_ORDER.filter((p) => (PLAN_RANK[p] ?? 0) >= requiredRank)

  return (
    <div>
      <Topbar title="Upgrade required" subtitle={`Unlock ${featureLabel} and more`} />
      <div className="p-6 max-w-3xl space-y-6">

        {/* Hero lockout notice */}
        <DashCard className="border-amber-200 bg-amber-50/40">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Lock size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900 mb-1">
                {featureLabel} is available on the{" "}
                <span className="capitalize">{requiredPlan}</span> plan and above
              </h2>
              <p className="text-sm text-gray-600">
                You&apos;re currently on the{" "}
                <span className="font-medium capitalize">{realPlan}</span> plan.
                Upgrade to unlock {featureLabel}{currentRank > 0 ? " without losing your current features" : ""}.
              </p>
            </div>
          </div>
        </DashCard>

        {/* Plan cards */}
        <div className={`grid grid-cols-1 gap-4 ${upgradePlans.length > 1 ? "md:grid-cols-" + upgradePlans.length : ""}`}>
          {upgradePlans.map((slug) => {
            const plan = PLAN_FEATURES[slug]
            if (!plan) return null
            const isLowestRequired = (PLAN_RANK[slug] ?? 0) === requiredRank
            return (
              <DashCard
                key={slug}
                className={isLowestRequired ? "border-clarity-300 bg-clarity-50/20 relative" : "relative"}
              >
                {isLowestRequired && (
                  <span className="absolute -top-2.5 left-4 text-[10px] bg-clarity-500 text-white px-2 py-0.5 rounded-full font-semibold">
                    Recommended
                  </span>
                )}
                <div className="flex items-start justify-between mb-3 mt-1">
                  <div>
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-xl font-bold text-gray-900 mt-0.5">
                      {plan.amountDisplay}
                      <span className="text-sm font-normal text-gray-400">/mo</span>
                    </p>
                  </div>
                  {slug === "pro" && (
                    <span className="flex items-center gap-1 text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-semibold">
                      <Zap size={9} /> Best value
                    </span>
                  )}
                </div>
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/dashboard/billing?from=${encodeURIComponent(safeTo)}`}
                  className={`flex items-center justify-center gap-1.5 w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    isLowestRequired
                      ? "bg-clarity-600 hover:bg-clarity-700 text-white"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Upgrade to {plan.name}
                  <ArrowRight size={13} />
                </Link>
              </DashCard>
            )
          })}
        </div>

        {/* Back link */}
        <p className="text-sm text-gray-400">
          <Link href="/dashboard" className="text-clarity-600 hover:text-clarity-700 font-medium">
            ← Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}
