import { createHmac } from "crypto"

const RAZORPAY_BASE = "https://api.razorpay.com/v1"

type RazorpayResult<T> = { ok: true; data: T } | { ok: false; error: string; code?: string }

// ── Plan catalogue ────────────────────────────────────────────────────────────

export const PLANS = {
  starter: {
    slug: "starter",
    name: "Starter",
    amount: 99900,         // paise
    amountDisplay: "₹999",
    period: "monthly" as const,
    envKey: "RAZORPAY_PLAN_ID_STARTER",
    features: ["Up to 500 customers", "WhatsApp feedback", "Basic loyalty", "Google review sync"],
  },
  growth: {
    slug: "growth",
    name: "Growth",
    amount: 249900,
    amountDisplay: "₹2,499",
    period: "monthly" as const,
    envKey: "RAZORPAY_PLAN_ID_GROWTH",
    features: ["Up to 2,000 customers", "Win-back campaigns", "Advanced analytics", "Priority support"],
  },
  pro: {
    slug: "pro",
    name: "Pro",
    amount: 499900,
    amountDisplay: "₹4,999",
    period: "monthly" as const,
    envKey: "RAZORPAY_PLAN_ID_PRO",
    features: ["Unlimited customers", "Multi-branch", "White-label reports", "Dedicated account manager"],
  },
} as const

export type PlanSlug = keyof typeof PLANS

export function getPlanId(slug: PlanSlug): string {
  const key = PLANS[slug].envKey
  const id = process.env[key]
  if (!id) throw new Error(`${key} is not set in environment variables`)
  return id
}

// ── Auth ──────────────────────────────────────────────────────────────────────

function authHeader(): string {
  const key = process.env.RAZORPAY_KEY_ID ?? ""
  const secret = process.env.RAZORPAY_KEY_SECRET ?? ""
  return "Basic " + Buffer.from(`${key}:${secret}`).toString("base64")
}

async function rzpPost<T>(path: string, body: unknown): Promise<RazorpayResult<T>> {
  try {
    const res = await fetch(`${RAZORPAY_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: data.error?.description || data.error?.reason || `Razorpay API error (${res.status})`, code: data.error?.code }
    }
    return { ok: true, data: data as T }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error reaching Razorpay" }
  }
}

async function rzpGet<T>(path: string): Promise<RazorpayResult<T>> {
  try {
    const res = await fetch(`${RAZORPAY_BASE}${path}`, {
      headers: { Authorization: authHeader() },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: data.error?.description || `Razorpay API error (${res.status})`, code: data.error?.code }
    }
    return { ok: true, data: data as T }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error reaching Razorpay" }
  }
}

// ── Customer ──────────────────────────────────────────────────────────────────

interface RazorpayCustomer {
  id: string
  name: string
  email: string
  contact: string
}

export async function createRazorpayCustomer(
  name: string,
  email: string,
  phone: string,
): Promise<RazorpayResult<RazorpayCustomer>> {
  return rzpPost<RazorpayCustomer>("/customers", {
    name,
    email,
    contact: phone,
    fail_existing: 0, // return existing customer if email/phone matches
  })
}

// ── Plans ─────────────────────────────────────────────────────────────────────

interface RazorpayPlan {
  id: string
  period: string
  interval: number
  item: { name: string; amount: number; unit_amount: number; currency: string }
}

export async function createRazorpayPlan(
  slug: PlanSlug,
): Promise<RazorpayResult<RazorpayPlan>> {
  const plan = PLANS[slug]
  return rzpPost<RazorpayPlan>("/plans", {
    period: "monthly",
    interval: 1,
    item: {
      name: `Alohive ${plan.name}`,
      amount: plan.amount,
      unit_amount: plan.amount,
      currency: "INR",
      description: `Alohive ${plan.name} plan – ${plan.amountDisplay}/month`,
    },
    notes: { slug },
  })
}

// ── Subscriptions ─────────────────────────────────────────────────────────────

interface RazorpaySubscription {
  id: string
  plan_id: string
  status: string
  customer_id: string | null
  short_url: string
  current_start: number | null
  current_end: number | null
  charge_at: number | null
  total_count: number
  paid_count: number
}

export async function createRazorpaySubscription(
  planId: string,
  customerId: string | null,
  callbackUrl: string,
  businessId: string,
): Promise<RazorpayResult<RazorpaySubscription>> {
  return rzpPost<RazorpaySubscription>("/subscriptions", {
    plan_id: planId,
    total_count: 0,           // 0 = infinite recurring
    quantity: 1,
    customer_notify: 1,
    ...(customerId ? { customer_id: customerId } : {}),
    notify_info: { notify_phone: undefined, notify_email: undefined },
    notes: { businessId },
    callback_url: callbackUrl,
    callback_method: "get",
  })
}

export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd = true,
): Promise<RazorpayResult<RazorpaySubscription>> {
  return rzpPost<RazorpaySubscription>(`/subscriptions/${subscriptionId}/cancel`, {
    cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0,
  })
}

export async function fetchRazorpaySubscription(
  subscriptionId: string,
): Promise<RazorpayResult<RazorpaySubscription>> {
  return rzpGet<RazorpaySubscription>(`/subscriptions/${subscriptionId}`)
}

// ── Webhook signature ─────────────────────────────────────────────────────────

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? ""
  if (!secret) return false
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex")
  return expected === signature
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map Razorpay status strings to our internal status values */
export function mapSubscriptionStatus(rzpStatus: string): string {
  switch (rzpStatus) {
    case "created":      return "created"
    case "authenticated": return "created"
    case "active":       return "active"
    case "pending":      return "past_due"
    case "halted":       return "halted"
    case "cancelled":    return "cancelled"
    case "completed":    return "completed"
    case "expired":      return "cancelled"
    default:             return rzpStatus
  }
}

export function planSlugFromPlanId(planId: string): PlanSlug | null {
  for (const [slug, cfg] of Object.entries(PLANS)) {
    const envId = process.env[cfg.envKey]
    if (envId && envId === planId) return slug as PlanSlug
  }
  return null
}

// ── Plan ordering (for upgrade/downgrade logic) ───────────────────────────────

export const PLAN_ORDER: Record<string, number> = { starter: 1, growth: 2, pro: 3 }

// ── Stored payment method ─────────────────────────────────────────────────────

export interface StoredPaymentMethod {
  last4: string
  network: string
  type: string | null
  expiryMonth: string
  expiryYear: string
}

interface RazorpayToken {
  id: string
  recurring: boolean
  card?: {
    last4: string
    network: string
    type?: string
    expiry_month: string
    expiry_year: string
  }
}

export async function fetchCustomerPaymentTokens(
  customerId: string,
): Promise<RazorpayResult<StoredPaymentMethod | null>> {
  const result = await rzpGet<{ items: RazorpayToken[]; count: number }>(
    `/customers/${customerId}/tokens`,
  )
  if (!result.ok) return { ok: false, error: result.error }
  const token = (result.data.items ?? []).find((t) => t.recurring && t.card)
  if (!token?.card) return { ok: true, data: null }
  return {
    ok: true,
    data: {
      last4: token.card.last4,
      network: token.card.network,
      type: token.card.type ?? null,
      expiryMonth: token.card.expiry_month,
      expiryYear: token.card.expiry_year,
    },
  }
}
