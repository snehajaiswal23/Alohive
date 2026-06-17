import { NextRequest, NextResponse } from "next/server"
import { findReferrerByCode, createPendingReferral, ReferralError } from "@/lib/referrals"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/referrals/[code]">) {
  const { code } = await ctx.params
  const referrer = await findReferrerByCode(code)
  if (!referrer) {
    return NextResponse.json({ error: "Invalid referral link" }, { status: 404 })
  }
  return NextResponse.json({ businessName: referrer.business.name, referrerName: referrer.name })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/referrals/[code]">) {
  const { code } = await ctx.params
  const referrer = await findReferrerByCode(code)
  if (!referrer) {
    return NextResponse.json({ error: "Invalid referral link" }, { status: 404 })
  }

  const { name, phone } = await req.json()

  try {
    await createPendingReferral(referrer.businessId, referrer.id, name, phone)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (e) {
    if (e instanceof ReferralError) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    throw e
  }
}
