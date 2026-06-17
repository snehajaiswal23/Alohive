import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember } from "@/lib/api-auth"
import { getOrCreateReferralCode, buildReferralLink } from "@/lib/referrals"
import { sendReferralLinkToCustomer } from "@/lib/whatsapp/send-referral-link"

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/business/[id]/customers/[customerId]/referral-link">,
) {
  const { id, customerId } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const customer = await prisma.customer.findFirst({ where: { id: customerId, businessId: id } })
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 })

  const code = await getOrCreateReferralCode(customer.id)
  return NextResponse.json({ link: buildReferralLink(code) })
}

export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/business/[id]/customers/[customerId]/referral-link">,
) {
  const { id, customerId } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const business = await prisma.business.findUnique({ where: { id } })
  const customer = await prisma.customer.findFirst({ where: { id: customerId, businessId: id } })
  if (!business || !customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 })

  const outcome = await sendReferralLinkToCustomer(business, customer)
  if (outcome === "skipped") {
    return NextResponse.json({ error: "WhatsApp is not connected for this business" }, { status: 409 })
  }
  if (outcome === "failed") {
    return NextResponse.json({ error: "Failed to send WhatsApp message" }, { status: 502 })
  }
  return NextResponse.json({ success: true })
}
