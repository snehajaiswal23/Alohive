import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/api-auth"

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/business/[id]/stylists/[staffId]">) {
  const { id, staffId } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const target = await prisma.staff.findFirst({ where: { id: staffId, businessId: id } })
  if (!target) {
    return NextResponse.json({ error: "Stylist not found" }, { status: 404 })
  }

  await prisma.staff.delete({ where: { id: staffId } })
  return NextResponse.json({ success: true })
}
