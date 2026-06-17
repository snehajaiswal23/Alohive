import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember, requireOwner } from "@/lib/api-auth"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const business = await prisma.business.findUnique({
    where: { id },
    select: {
      id: true, name: true, type: true, city: true, locality: true,
      phone: true, whatsappNumber: true, googleReviewLink: true,
      googlePlaceId: true, logoUrl: true, plan: true, status: true,
      createdAt: true,
    },
  })
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(business)
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/business/[id]">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const {
    name, type, city, locality, phone, whatsappNumber, googleReviewLink, logoUrl,
  } = await req.json()

  const business = await prisma.business.update({
    where: { id },
    data: {
      ...(name             !== undefined ? { name }             : {}),
      ...(type             !== undefined ? { type }             : {}),
      ...(city             !== undefined ? { city }             : {}),
      ...(locality         !== undefined ? { locality }         : {}),
      ...(phone            !== undefined ? { phone }            : {}),
      ...(whatsappNumber   !== undefined ? { whatsappNumber }   : {}),
      ...(googleReviewLink !== undefined ? { googleReviewLink } : {}),
      ...(logoUrl          !== undefined ? { logoUrl }          : {}),
    },
    select: {
      id: true, name: true, type: true, city: true, locality: true,
      phone: true, whatsappNumber: true, googleReviewLink: true, logoUrl: true, plan: true,
    },
  })
  return NextResponse.json(business)
}
