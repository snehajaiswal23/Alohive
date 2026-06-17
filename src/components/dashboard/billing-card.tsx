"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashCard } from "@/components/ui/card"
import { PLANS, PLAN_ORDER, type PlanSlug, type StoredPaymentMethod } from "@/lib/razorpay"
import {
  CheckCircle2, AlertCircle, Clock, XCircle, CreditCard,
  TrendingUp, TrendingDown, ExternalLink, AlertTriangle,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubscriptionState {
  plan: string
  status: string
  razorpaySubscriptionId: string | null
  razorpayShortUrl: string | null
  razorpayCustomerId: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  canceledAt: string | null
  paymentMethod: StoredPaymentMethod | null
}

interface BillingManagerProps {
  businessId: string
  subscription: SubscriptionState | null
}

// ── Status meta ───────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: "green" | "amber" | "red" | "gray" | "blue"; Icon: typeof CheckCircle2 }> = {
  active:          { label: "Active",           color: "green", Icon: CheckCircle2 },
  trialing:        { label: "Free trial",       color: "blue",  Icon: Clock },
  created:         { label: "Awaiting payment", color: "amber", Icon: Clock },
  payment_pending: { label: "Payment pending",  color: "amber", Icon: Clock },
  past_due:        { label: "Payment overdue",  color: "red",   Icon: AlertCircle },
  halted:          { label: "Halted",           color: "red",   Icon: XCircle },
  cancelled:       { label: "Cancelled",        color: "gray",  Icon: XCircle },
  completed:       { label: "Completed",        color: "gray",  Icon: CheckCircle2 },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null, opts?: Intl.DateTimeFormatOptions) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-IN", opts ?? { day: "numeric", month: "short", year: "numeric" })
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}

function networkIcon(network: string) {
  const n = network.toLowerCase()
  if (n.includes("visa")) return "VISA"
  if (n.includes("master")) return "MC"
  if (n.includes("rupay")) return "RuPay"
  if (n.includes("amex")) return "Amex"
  return network
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PaymentMethodCard({
  paymentMethod,
  shortUrl,
}: {
  paymentMethod: StoredPaymentMethod | null
  shortUrl: string | null
}) {
  return (
    <DashCard className="h-full">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard size={15} className="text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-800">Payment method</h3>
      </div>

      {paymentMethod ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-10 h-7 bg-white border border-gray-200 rounded-md flex items-center justify-center text-[10px] font-bold text-gray-600">
              {networkIcon(paymentMethod.network)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                •••• •••• •••• {paymentMethod.last4}
              </p>
              <p className="text-xs text-gray-400">
                {paymentMethod.network}{paymentMethod.type ? ` ${paymentMethod.type}` : ""} · Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
              </p>
            </div>
          </div>
          {shortUrl && (
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-clarity-600 hover:text-clarity-700 font-medium"
            >
              <ExternalLink size={11} />
              Update via Razorpay
            </a>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <CreditCard size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-400">No card saved yet.</p>
          <p className="text-xs text-gray-300 mt-0.5">Saved automatically on first payment.</p>
          {shortUrl && (
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-xs text-clarity-600 hover:text-clarity-700 font-medium"
            >
              <ExternalLink size={11} />
              Complete payment
            </a>
          )}
        </div>
      )}
    </DashCard>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function BillingCard({ businessId, subscription }: BillingManagerProps) {
  const [upgrading, setUpgrading] = useState<PlanSlug | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState("")
  const [showDowngradeWarn, setShowDowngradeWarn] = useState<PlanSlug | null>(null)

  const currentPlan = subscription?.plan
  const status = subscription?.status ?? ""
  const statusMeta = STATUS_META[status] ?? { label: status, color: "gray" as const, Icon: Clock }
  const isCancelledAtEnd = subscription?.canceledAt && subscription.status === "active"
  const daysLeft = daysUntil(subscription?.currentPeriodEnd ?? null)
  const isTrialWarning = status === "trialing" && daysLeft !== null && daysLeft <= 3
  const currentRank = currentPlan ? (PLAN_ORDER[currentPlan] ?? 0) : 0

  async function handleSubscribe(plan: PlanSlug, skipConfirm = false) {
    const targetRank = PLAN_ORDER[plan] ?? 0
    if (!skipConfirm && currentRank > 0 && targetRank < currentRank) {
      setShowDowngradeWarn(plan)
      return
    }
    setShowDowngradeWarn(null)
    setError("")
    setUpgrading(plan)
    try {
      const res = await fetch(`/api/business/${businessId}/billing/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Something went wrong"); return }
      if (data.checkoutUrl) window.location.href = data.checkoutUrl
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setUpgrading(null)
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel subscription? You'll keep access until the end of your current billing period.")) return
    setError("")
    setCancelling(true)
    try {
      const res = await fetch(`/api/business/${businessId}/billing/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ immediately: false }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Something went wrong"); return }
      window.location.reload()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setCancelling(false)
    }
  }

  const canCancel = subscription &&
    ["active", "trialing"].includes(subscription.status) &&
    !subscription.canceledAt

  // ── Downgrade confirmation dialog ──────────────────────────────────────────
  if (showDowngradeWarn) {
    const target = PLANS[showDowngradeWarn]
    return (
      <DashCard className="border-amber-200 bg-amber-50/40">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">Downgrade to {target.name}?</h3>
            <p className="text-xs text-gray-600">
              You'll lose features included in your current plan. Your new plan takes effect at the
              start of the next billing cycle.
            </p>
          </div>
        </div>
        <ul className="mb-4 space-y-1">
          {target.features.map((f) => (
            <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
              <CheckCircle2 size={11} className="text-green-500 shrink-0" /> {f}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-gray-200 text-gray-600"
            onClick={() => setShowDowngradeWarn(null)}
          >
            Keep current plan
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="bg-amber-500 hover:bg-amber-600 border-amber-500"
            onClick={() => handleSubscribe(showDowngradeWarn, true)}
            disabled={upgrading === showDowngradeWarn}
          >
            {upgrading === showDowngradeWarn ? "Redirecting…" : `Downgrade to ${target.name}`}
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </DashCard>
    )
  }

  return (
    <div className="space-y-4">
      {/* Trial expiring soon warning */}
      {isTrialWarning && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-[12px] px-4 py-3">
          <AlertTriangle size={15} className="shrink-0" />
          Your free trial ends in {daysLeft} day{daysLeft === 1 ? "" : "s"}. Subscribe to keep access.
        </div>
      )}

      {/* Pending payment notice */}
      {(status === "created" || status === "payment_pending") && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-[12px] px-4 py-3">
          <Clock size={15} className="shrink-0" />
          <span>
            Payment not completed yet.
            {subscription?.razorpayShortUrl && (
              <> <a href={subscription.razorpayShortUrl} className="underline font-medium ml-1">Complete checkout</a></>
            )}
          </span>
        </div>
      )}

      {/* Top row: current plan hero + payment method */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Current plan hero */}
        <DashCard className="lg:col-span-2">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Current plan</h2>
              <p className="text-2xl font-bold text-gray-900">
                {currentPlan === "trial"
                  ? "Free Trial"
                  : currentPlan && currentPlan in PLANS
                  ? PLANS[currentPlan as PlanSlug].name
                  : (currentPlan ?? "None")}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {currentPlan === "trial"
                  ? "14-day free trial"
                  : currentPlan && currentPlan in PLANS
                  ? `${PLANS[currentPlan as PlanSlug].amountDisplay}/month`
                  : ""}
              </p>
            </div>
            <Badge color={statusMeta.color} variant="subtle" className="flex items-center gap-1 shrink-0">
              <statusMeta.Icon size={11} />
              {statusMeta.label}
            </Badge>
          </div>

          {/* Period / renewal info */}
          {subscription?.currentPeriodEnd && (
            <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
              {isCancelledAtEnd ? (
                <span className="text-red-500 font-medium">
                  Access ends {fmtDate(subscription.currentPeriodEnd, { day: "numeric", month: "short", year: "numeric" })}
                </span>
              ) : (
                <span>
                  Renews {fmtDate(subscription.currentPeriodEnd, { day: "numeric", month: "short", year: "numeric" })}
                  {daysLeft !== null && daysLeft > 0 && (
                    <span className="ml-1 text-gray-400">({daysLeft}d)</span>
                  )}
                </span>
              )}
              {subscription.currentPeriodStart && (
                <span className="text-gray-300">
                  · Period: {fmtDate(subscription.currentPeriodStart, { day: "numeric", month: "short" })} – {fmtDate(subscription.currentPeriodEnd, { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
          )}

          {/* Features of current plan */}
          {currentPlan && currentPlan in PLANS && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mb-4">
              {PLANS[currentPlan as PlanSlug].features.map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          )}

          {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

          {canCancel && (
            <div className="pt-3 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 text-gray-500 rounded-lg text-xs"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling…" : "Cancel subscription"}
              </Button>
            </div>
          )}
        </DashCard>

        {/* Payment method */}
        <PaymentMethodCard
          paymentMethod={subscription?.paymentMethod ?? null}
          shortUrl={subscription?.razorpayShortUrl ?? null}
        />
      </div>

      {/* Plan selection */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          {currentPlan === "trial" || !currentPlan ? "Choose a plan" : "Change plan"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(PLANS) as [PlanSlug, (typeof PLANS)[PlanSlug]][]).map(([slug, plan]) => {
            const isCurrent = currentPlan === slug
            const targetRank = PLAN_ORDER[slug] ?? 0
            const isUpgrade = currentRank > 0 && targetRank > currentRank
            const isDowngrade = currentRank > 0 && targetRank < currentRank
            const isPopular = slug === "growth"
            const isLoading = upgrading === slug

            let btnLabel = "Subscribe"
            if (isCurrent) btnLabel = "Current plan"
            else if (currentPlan && currentPlan !== "trial") {
              btnLabel = isUpgrade ? "Upgrade" : "Downgrade"
            }

            return (
              <DashCard
                key={slug}
                className={[
                  "relative transition-shadow",
                  isCurrent ? "border-green-300 bg-green-50/20 shadow-sm" : "",
                  isPopular && !isCurrent ? "border-clarity-200" : "",
                ].join(" ")}
              >
                {isPopular && !isCurrent && (
                  <span className="absolute -top-2.5 left-4 text-[10px] bg-clarity-500 text-white px-2 py-0.5 rounded-full font-semibold">
                    Popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-2.5 left-4 text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                    Your plan
                  </span>
                )}

                <h3 className="font-semibold text-gray-900 mb-0.5 mt-1">{plan.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-3">
                  {plan.amountDisplay}
                  <span className="text-sm font-normal text-gray-400">/mo</span>
                </p>

                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <CheckCircle2 size={11} className="text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-green-200 text-green-700 cursor-default"
                    disabled
                  >
                    <CheckCircle2 size={12} />
                    Current plan
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 border-green-600"
                    onClick={() => handleSubscribe(slug)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Redirecting…" : (
                      <><TrendingUp size={12} /> {btnLabel}</>
                    )}
                  </Button>
                ) : isDowngrade ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-300 text-gray-600 hover:border-amber-300 hover:text-amber-700"
                    onClick={() => handleSubscribe(slug)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Redirecting…" : (
                      <><TrendingDown size={12} /> {btnLabel}</>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleSubscribe(slug)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Redirecting…" : btnLabel}
                  </Button>
                )}
              </DashCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
