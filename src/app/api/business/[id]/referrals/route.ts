import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember } from "@/lib/api-auth"
import { createPendingReferral, ReferralError } from "@/lib/referrals"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/referrals">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const referrals = await prisma.referral.findMany({
    where: { businessId: id },
    orderBy: { createdAt: "desc" },
    include: { referrer: true, referred: true },
  })

  return NextResponse.json({ referrals })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/referrals">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const { referrerCustomerId, referredPhone, referredName } = await req.json()
  if (!referrerCustomerId) {
    return NextResponse.json({ error: "referrerCustomerId is required" }, { status: 400 })
  }

  try {
    const referral = await createPendingReferral(id, referrerCustomerId, referredName, referredPhone)
    return NextResponse.json({ referral }, { status: 201 })
  } catch (e) {
    if (e instanceof ReferralError) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    throw e
  }
}
