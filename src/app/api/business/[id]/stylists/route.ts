import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember, requireOwner } from "@/lib/api-auth"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/stylists">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const stylists = await prisma.staff.findMany({
    where: { businessId: id },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ stylists })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/stylists">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const { name, roleLabel } = await req.json()
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const stylist = await prisma.staff.create({
    data: { businessId: id, name, roleLabel: roleLabel || undefined },
  })

  return NextResponse.json({ stylist }, { status: 201 })
}
