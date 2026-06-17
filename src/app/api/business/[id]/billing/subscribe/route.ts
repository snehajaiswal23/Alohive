import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/api-auth"
import {
  createRazorpayCustomer,
  createRazorpaySubscription,
  cancelRazorpaySubscription,
  getPlanId,
  PLANS,
  type PlanSlug,
} from "@/lib/razorpay"

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/billing/subscribe">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const body = await req.json()
  const { plan } = body

  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  const planSlug = plan as PlanSlug

  let planId: string
  try {
    planId = getPlanId(planSlug)
  } catch {
    return NextResponse.json({ error: `Plan ID not configured for ${plan}` }, { status: 503 })
  }

  const business = await prisma.business.findUnique({
    where: { id },
    include: { subscription: true },
  })
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

  // Cancel existing active Razorpay subscription if switching plans
  const existing = business.subscription
  if (existing?.razorpaySubscriptionId && ["active", "created"].includes(existing.status)) {
    await cancelRazorpaySubscription(existing.razorpaySubscriptionId, false)
  }

  // Reuse existing Razorpay customer or create a new one
  let customerId = existing?.razorpayCustomerId ?? null
  if (!customerId) {
    const ownerUser = await prisma.user.findFirst({
      where: { businessId: id, role: "owner" },
    })
    if (ownerUser) {
      const custResult = await createRazorpayCustomer(ownerUser.name, ownerUser.email, business.phone)
      if (custResult.ok) customerId = custResult.data.id
    }
  }

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?subscribed=1`
  const subResult = await createRazorpaySubscription(planId, customerId, callbackUrl, id)

  if (!subResult.ok) {
    return NextResponse.json({ error: subResult.error }, { status: 502 })
  }

  const subscription = await prisma.subscription.upsert({
    where: { businessId: id },
    create: {
      businessId: id,
      plan: planSlug,
      status: "created",
      razorpaySubscriptionId: subResult.data.id,
      razorpayCustomerId: customerId,
      razorpayShortUrl: subResult.data.short_url,
    },
    update: {
      plan: planSlug,
      status: "created",
      razorpaySubscriptionId: subResult.data.id,
      razorpayCustomerId: customerId,
      razorpayShortUrl: subResult.data.short_url,
      canceledAt: null,
    },
  })

  return NextResponse.json({
    subscription: { id: subscription.id, plan: subscription.plan, status: subscription.status },
    checkoutUrl: subResult.data.short_url,
  })
}
