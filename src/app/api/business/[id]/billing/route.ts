import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember } from "@/lib/api-auth"
import { PLANS, fetchRazorpaySubscription } from "@/lib/razorpay"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/billing">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const [subscription, invoices] = await Promise.all([
    prisma.subscription.findUnique({ where: { businessId: id } }),
    prisma.invoice.findMany({
      where: { businessId: id },
      orderBy: { createdAt: "desc" },
      take: 24,
    }),
  ])

  // If subscription has a Razorpay ID and status is "created", check for updates
  // (the user may have paid but webhook hasn't fired yet during testing)
  let liveStatus: string | null = null
  if (subscription?.razorpaySubscriptionId && subscription.status === "created") {
    const live = await fetchRazorpaySubscription(subscription.razorpaySubscriptionId)
    if (live.ok && live.data.status !== "created") {
      liveStatus = live.data.status
    }
  }

  const planMeta = subscription?.plan && subscription.plan in PLANS
    ? PLANS[subscription.plan as keyof typeof PLANS]
    : null

  return NextResponse.json({
    subscription: subscription
      ? {
          id: subscription.id,
          plan: subscription.plan,
          planMeta,
          status: liveStatus ? liveStatus : subscription.status,
          razorpaySubscriptionId: subscription.razorpaySubscriptionId,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          canceledAt: subscription.canceledAt,
          createdAt: subscription.createdAt,
        }
      : null,
    invoices: invoices.map((inv) => ({
      id: inv.id,
      amount: inv.amount,
      currency: inv.currency,
      status: inv.status,
      description: inv.description,
      periodStart: inv.periodStart,
      periodEnd: inv.periodEnd,
      razorpayPaymentId: inv.razorpayPaymentId,
      createdAt: inv.createdAt,
    })),
  })
}
