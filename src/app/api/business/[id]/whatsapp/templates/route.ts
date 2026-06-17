import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember, requireOwner } from "@/lib/api-auth"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/whatsapp/templates">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const templates = await prisma.whatsappTemplate.findMany({
    where: { businessId: id },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json({ templates })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/whatsapp/templates">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const { name, category, body } = await req.json()
  if (!name || !body) {
    return NextResponse.json({ error: "Name and body are required" }, { status: 400 })
  }
  if (!/^[a-z0-9_]+$/.test(name)) {
    return NextResponse.json({ error: "Name must be lowercase letters, numbers, and underscores only" }, { status: 400 })
  }

  const existing = await prisma.whatsappTemplate.findUnique({ where: { businessId_name: { businessId: id, name } } })
  if (existing) {
    return NextResponse.json({ error: "A template with this name already exists" }, { status: 409 })
  }

  const template = await prisma.whatsappTemplate.create({
    data: { businessId: id, name, category: category || "Utility", body, status: "draft" },
  })

  return NextResponse.json({ template }, { status: 201 })
}
