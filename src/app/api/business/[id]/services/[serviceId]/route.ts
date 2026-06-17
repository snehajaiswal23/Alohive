import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/api-auth"

async function findTargetService(businessId: string, serviceId: string) {
  return prisma.service.findFirst({ where: { id: serviceId, businessId } })
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/business/[id]/services/[serviceId]">) {
  const { id, serviceId } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const { isActive } = await req.json()
  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "isActive (boolean) is required" }, { status: 400 })
  }

  const target = await findTargetService(id, serviceId)
  if (!target) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 })
  }

  const service = await prisma.service.update({ where: { id: serviceId }, data: { isActive } })
  return NextResponse.json({ service })
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/business/[id]/services/[serviceId]">) {
  const { id, serviceId } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const target = await findTargetService(id, serviceId)
  if (!target) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 })
  }

  await prisma.service.delete({ where: { id: serviceId } })
  return NextResponse.json({ success: true })
}
