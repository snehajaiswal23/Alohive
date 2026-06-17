import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/api-auth"

async function findTargetReceptionist(businessId: string, userId: string) {
  return prisma.user.findFirst({ where: { id: userId, businessId, role: "receptionist" } })
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/business/[id]/staff/[userId]">) {
  const { id, userId } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const { isActive } = await req.json()
  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "isActive (boolean) is required" }, { status: 400 })
  }

  const target = await findTargetReceptionist(id, userId)
  if (!target) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
  }

  const staff = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, name: true, email: true, isActive: true, lastLogin: true, createdAt: true },
  })

  return NextResponse.json({ staff })
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/business/[id]/staff/[userId]">) {
  const { id, userId } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const target = await findTargetReceptionist(id, userId)
  if (!target) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
  }

  await prisma.user.delete({ where: { id: userId } })

  return NextResponse.json({ success: true })
}
