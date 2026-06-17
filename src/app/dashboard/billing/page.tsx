import { cookies } from "next/headers"
import { Topbar } from "@/components/dashboard/topbar"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BillingCard } from "@/components/dashboard/billing-card"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { fetchCustomerPaymentTokens, type StoredPaymentMethod } from "@/lib/razorpay"
import { Receipt, ExternalLink } from "lucide-react"

interface BillingPageProps {
  searchParams: Promise<{ subscribed?: string }>
}

function parsePaymentMethod(raw: unknown): StoredPaymentMethod | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>
  if (typeof r.last4 !== "string" || typeof r.network !== "string") return null
  return {
    last4: r.last4,
    network: r.network,
    type: typeof r.type === "string" ? r.type : null,
    expiryMonth: typeof r.expiryMonth === "string" ? r.expiryMonth : "",
    expiryYear: typeof r.expiryYear === "string" ? r.expiryYear : "",
  }
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const { subscribed } = await searchParams
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const payload = token ? await verifySession(token).catch(() => null) : null
  const user = payload ? await prisma.user.findUnique({ where: { id: payload.userId } }) : null

  const [subscription, invoices] = user
    ? await Promise.all([
        prisma.subscription.findUnique({ where: { businessId: user.businessId } }),
        prisma.invoice.findMany({
          where: { businessId: user.businessId },
          orderBy: { createdAt: "desc" },
          take: 24,
        }),
      ])
    : [null, []]

  // Resolve payment method: use stored value; fall back to live Razorpay token fetch
  let paymentMethod: StoredPaymentMethod | null = parsePaymentMethod(subscription?.paymentMethod)
  if (!paymentMethod && subscription?.razorpayCustomerId) {
    const tokenResult = await fetchCustomerPaymentTokens(subscription.razorpayCustomerId)
    if (tokenResult.ok && tokenResult.data) paymentMethod = tokenResult.data
  }

  const subForClient = subscription
    ? {
        plan: subscription.plan,
        status: subscription.status,
        razorpaySubscriptionId: subscription.razorpaySubscriptionId,
        razorpayShortUrl: subscription.razorpayShortUrl,
        razorpayCustomerId: subscription.razorpayCustomerId,
        currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
        canceledAt: subscription.canceledAt?.toISOString() ?? null,
        paymentMethod,
      }
    : null

  return (
    <div>
      <Topbar title="Billing" subtitle="Manage your plan and payment history" />
      <div className="p-6 space-y-6 max-w-4xl">

        {subscribed === "1" && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-[12px] px-4 py-3 flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Payment successful — your subscription is now active. Welcome aboard!
          </div>
        )}

        {user && <BillingCard businessId={user.businessId} subscription={subForClient} />}

        {/* Invoice history */}
        <DashCard>
          <div className="flex items-center gap-2 mb-4">
            <Receipt size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-800">Payment history</h2>
            {invoices.length > 0 && (
              <span className="ml-auto text-xs text-gray-400">{invoices.length} record{invoices.length === 1 ? "" : "s"}</span>
            )}
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <Receipt size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No payments yet.</p>
              <p className="text-xs text-gray-300 mt-0.5">Invoices appear here after each successful charge.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {inv.description || "Subscription payment"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {inv.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {inv.periodStart && inv.periodEnd && (
                        <span className="ml-2 text-gray-300">
                          · {inv.periodStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          {" – "}
                          {inv.periodEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      color={inv.status === "paid" ? "green" : inv.status === "failed" ? "red" : "amber"}
                      variant="subtle"
                      className="capitalize"
                    >
                      {inv.status}
                    </Badge>
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">
                      {formatCurrency(inv.amount, inv.currency)}
                    </span>
                    {inv.razorpayPaymentId && inv.status === "paid" && (
                      <a
                        href={`https://dashboard.razorpay.com/app/payments/${inv.razorpayPaymentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-clarity-500 transition-colors"
                        title="View receipt"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashCard>
      </div>
    </div>
  )
}
