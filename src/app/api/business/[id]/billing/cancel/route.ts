import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/api-auth"
import { cancelRazorpaySubscription } from "@/lib/razorpay"

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/billing/cancel">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const body = await req.json().catch(() => ({}))
  // cancelAtCycleEnd=true means access continues until period end (default, user-friendly)
  const cancelAtCycleEnd = body.immediately !== true

  const subscription = await prisma.subscription.findUnique({ where: { businessId: id } })
  if (!subscription) {
    return NextResponse.json({ error: "No active subscription" }, { status: 404 })
  }

  if (!subscription.razorpaySubscriptionId) {
    // Trial or manual subscription — just mark as cancelled locally
    await prisma.subscription.update({
      where: { businessId: id },
      data: { status: "cancelled", canceledAt: new Date() },
    })
    return NextResponse.json({ cancelled: true })
  }

  const result = await cancelRazorpaySubscription(subscription.razorpaySubscriptionId, cancelAtCycleEnd)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  await prisma.subscription.update({
    where: { businessId: id },
    data: {
      status: cancelAtCycleEnd ? "active" : "cancelled", // stays active until period end if cancelAtCycleEnd
      canceledAt: new Date(),
    },
  })

  return NextResponse.json({
    cancelled: true,
    accessUntil: cancelAtCycleEnd ? subscription.currentPeriodEnd : null,
  })
}
