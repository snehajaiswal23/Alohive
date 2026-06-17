import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember, requireOwner } from "@/lib/api-auth"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/services">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const services = await prisma.service.findMany({
    where: { businessId: id },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ services })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/services">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const { name, category, price } = await req.json()
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const service = await prisma.service.create({
    data: { businessId: id, name, category: category || null, price: price ?? null },
  })

  return NextResponse.json({ service }, { status: 201 })
}
