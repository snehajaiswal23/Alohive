import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember } from "@/lib/api-auth"
import { normalizePhone } from "@/lib/phone"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/customers/lookup">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const phone = normalizePhone(req.nextUrl.searchParams.get("phone") || "")
  if (phone.length < 10) {
    return NextResponse.json({ error: "A valid phone number is required" }, { status: 400 })
  }

  const customer = await prisma.customer.findFirst({ where: { businessId: id, phone } })
  return NextResponse.json({ customer })
}
