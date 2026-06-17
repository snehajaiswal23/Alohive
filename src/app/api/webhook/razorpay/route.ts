import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyWebhookSignature, mapSubscriptionStatus, planSlugFromPlanId } from "@/lib/razorpay"

// Razorpay sends Unix timestamps (seconds); convert to Date
function unixToDate(ts: number | null | undefined): Date | null {
  return ts ? new Date(ts * 1000) : null
}

interface RzpSubscriptionEntity {
  id: string
  plan_id: string
  status: string
  customer_id: string | null
  current_start: number | null
  current_end: number | null
  paid_count: number
}

interface RzpPaymentEntity {
  id: string
  amount: number
  currency: string
  status: string
  subscription_id: string | null
  description: string | null
  card?: {
    last4?: string
    network?: string
    type?: string
    expiry_month?: string
    expiry_year?: string
  }
}

interface RzpEvent {
  event: string
  payload: {
    subscription?: { entity: RzpSubscriptionEntity }
    payment?: { entity: RzpPaymentEntity }
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-razorpay-signature") ?? ""
  const rawBody = await req.text()

  if (!verifyWebhookSignature(rawBody, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event: RzpEvent = JSON.parse(rawBody)
  const sub = event.payload.subscription?.entity
  const payment = event.payload.payment?.entity

  switch (event.event) {
    case "subscription.activated":
    case "subscription.authenticated": {
      if (!sub) break
      await handleSubscriptionUpdate(sub, "active")
      break
    }

    case "subscription.charged": {
      if (!sub) break
      await handleSubscriptionUpdate(sub, "active")
      // Record the invoice for this charge
      if (payment) {
        await recordInvoice(payment, sub)
      }
      break
    }

    case "subscription.pending": {
      if (!sub) break
      await handleSubscriptionUpdate(sub, "past_due")
      break
    }

    case "subscription.halted": {
      if (!sub) break
      await handleSubscriptionUpdate(sub, "halted")
      await createSubscriptionNotification(sub, "halted")
      break
    }

    case "subscription.cancelled": {
      if (!sub) break
      await prisma.subscription.updateMany({
        where: { razorpaySubscriptionId: sub.id },
        data: {
          status: "cancelled",
          canceledAt: new Date(),
          updatedAt: new Date(),
        },
      })
      await syncBusinessPlan(sub, "cancelled")
      break
    }

    case "subscription.completed": {
      if (!sub) break
      await handleSubscriptionUpdate(sub, "completed")
      break
    }

    case "payment.failed": {
      if (!payment?.subscription_id) break
      // Mark latest invoice as failed; subscription goes to past_due
      await prisma.invoice.create({
        data: {
          businessId: await getBusinessIdFromSubscription(payment.subscription_id),
          amount: payment.amount / 100,
          currency: payment.currency,
          razorpayPaymentId: payment.id,
          razorpaySubscriptionId: payment.subscription_id,
          status: "failed",
          description: payment.description || "Subscription payment failed",
        },
      })
      break
    }
  }

  return Response.json({ received: true })
}

async function handleSubscriptionUpdate(sub: RzpSubscriptionEntity, forceStatus?: string) {
  const status = forceStatus ?? mapSubscriptionStatus(sub.status)
  const periodStart = unixToDate(sub.current_start ?? undefined)
  const periodEnd = unixToDate(sub.current_end ?? undefined)

  const updated = await prisma.subscription.updateMany({
    where: { razorpaySubscriptionId: sub.id },
    data: {
      status,
      currentPeriodStart: periodStart ?? undefined,
      currentPeriodEnd: periodEnd ?? undefined,
      updatedAt: new Date(),
    },
  })

  if (updated.count === 0) return

  // Sync Business.plan from the plan_id
  await syncBusinessPlan(sub, status)
}

async function syncBusinessPlan(sub: RzpSubscriptionEntity, status: string) {
  const row = await prisma.subscription.findFirst({ where: { razorpaySubscriptionId: sub.id } })
  if (!row) return

  const planSlug = planSlugFromPlanId(sub.plan_id) ?? row.plan
  const isActive = status === "active"

  await prisma.business.update({
    where: { id: row.businessId },
    data: { plan: isActive ? planSlug : row.plan },
  })

  if (isActive && planSlug !== row.plan) {
    await prisma.subscription.update({
      where: { id: row.id },
      data: { plan: planSlug },
    })
  }
}

async function recordInvoice(payment: RzpPaymentEntity, sub: RzpSubscriptionEntity) {
  const businessId = await getBusinessIdFromSubscription(sub.id)
  if (!businessId) return

  const existing = await prisma.invoice.findFirst({
    where: { razorpayPaymentId: payment.id },
  })
  if (existing) return // idempotent

  await prisma.invoice.create({
    data: {
      businessId,
      amount: payment.amount / 100,
      currency: payment.currency,
      razorpayPaymentId: payment.id,
      razorpaySubscriptionId: sub.id,
      status: "paid",
      description: `Subscription charge – ${sub.paid_count > 1 ? `payment #${sub.paid_count}` : "first payment"}`,
      periodStart: unixToDate(sub.current_start ?? undefined),
      periodEnd: unixToDate(sub.current_end ?? undefined),
    },
  })

  // Store card details for payment method display
  if (payment.card?.last4) {
    await prisma.subscription.updateMany({
      where: { razorpaySubscriptionId: sub.id },
      data: {
        paymentMethod: {
          last4: payment.card.last4,
          network: payment.card.network ?? "Card",
          type: payment.card.type ?? null,
          expiryMonth: payment.card.expiry_month ?? "",
          expiryYear: payment.card.expiry_year ?? "",
        },
      },
    })
  }
}

async function getBusinessIdFromSubscription(subscriptionId: string): Promise<string> {
  const row = await prisma.subscription.findFirst({
    where: { razorpaySubscriptionId: subscriptionId },
    select: { businessId: true },
  })
  return row?.businessId ?? ""
}

async function createSubscriptionNotification(sub: RzpSubscriptionEntity, type: "halted") {
  const businessId = await getBusinessIdFromSubscription(sub.id)
  if (!businessId) return

  await prisma.notification.create({
    data: {
      businessId,
      type: `subscription_${type}`,
      title: "Subscription payment failed",
      message:
        "We couldn't collect your subscription payment after multiple attempts. Please update your payment method in Billing to avoid losing access.",
    },
  })
}
