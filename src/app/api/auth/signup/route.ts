import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, signSession, SESSION_COOKIE } from "@/lib/auth"
import {
  createRazorpayCustomer,
  createRazorpaySubscription,
  getPlanId,
  PLANS,
  type PlanSlug,
} from "@/lib/razorpay"

const PAID_PLANS = new Set<string>(Object.keys(PLANS))
PAID_PLANS.delete("trial" as never) // trial is not a Razorpay plan

function isPaidPlan(plan: string): plan is PlanSlug {
  return plan in PLANS
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    email,
    password,
    ownerName,
    businessName,
    businessType,
    city,
    locality,
    phone,
    whatsappNumber,
    googleReviewLink,
    plan = "trial",
  } = body

  if (!email || !password || !ownerName || !businessName || !businessType || !city || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (plan !== "trial" && !isPaidPlan(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)

  const { business, user } = await prisma.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: {
        name: businessName,
        type: businessType,
        city,
        locality: locality || null,
        phone,
        whatsappNumber: whatsappNumber || null,
        googleReviewLink: googleReviewLink || null,
        plan: plan === "trial" ? "trial" : plan,
      },
    })

    const user = await tx.user.create({
      data: {
        businessId: business.id,
        email,
        passwordHash,
        name: ownerName,
        role: "owner",
      },
    })

    // Create a trial subscription record for free-trial accounts
    if (plan === "trial") {
      const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      await tx.subscription.create({
        data: {
          businessId: business.id,
          plan: "trial",
          status: "trialing",
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEnd,
        },
      })
    }

    return { business, user }
  })

  let checkoutUrl: string | null = null

  // For paid plans: create Razorpay customer + subscription outside the DB transaction
  if (plan !== "trial" && isPaidPlan(plan)) {
    try {
      const planId = getPlanId(plan)
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=1`

      const customerResult = await createRazorpayCustomer(ownerName, email, phone)
      const customerId = customerResult.ok ? customerResult.data.id : null

      const subResult = await createRazorpaySubscription(planId, customerId, callbackUrl, business.id)

      if (subResult.ok) {
        await prisma.subscription.upsert({
          where: { businessId: business.id },
          create: {
            businessId: business.id,
            plan,
            status: "created",
            razorpaySubscriptionId: subResult.data.id,
            razorpayCustomerId: customerId,
            razorpayShortUrl: subResult.data.short_url,
          },
          update: {
            plan,
            status: "created",
            razorpaySubscriptionId: subResult.data.id,
            razorpayCustomerId: customerId,
            razorpayShortUrl: subResult.data.short_url,
          },
        })
        checkoutUrl = subResult.data.short_url
      } else {
        // Subscription creation failed — fall back to trial so the account is still usable
        await prisma.subscription.upsert({
          where: { businessId: business.id },
          create: { businessId: business.id, plan, status: "payment_pending" },
          update: { plan, status: "payment_pending" },
        })
      }
    } catch {
      // Non-fatal: account is created, billing can be set up from the dashboard
      await prisma.subscription.upsert({
        where: { businessId: business.id },
        create: { businessId: business.id, plan, status: "payment_pending" },
        update: { plan, status: "payment_pending" },
      })
    }
  }

  const token = await signSession({ userId: user.id, businessId: business.id, role: user.role, plan: business.plan })

  const res = NextResponse.json(
    {
      success: true,
      business: { id: business.id, name: business.name },
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      checkoutUrl,
    },
    { status: 201 },
  )

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  return res
}
