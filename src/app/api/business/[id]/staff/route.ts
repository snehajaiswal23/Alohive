import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { requireOwner } from "@/lib/api-auth"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/staff">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const staff = await prisma.user.findMany({
    where: { businessId: id, role: "receptionist" },
    select: { id: true, name: true, email: true, isActive: true, lastLogin: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json({ staff })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/staff">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const { name, email, password } = await req.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  const staff = await prisma.user.create({
    data: { businessId: id, name, email, passwordHash, role: "receptionist" },
    select: { id: true, name: true, email: true, isActive: true, lastLogin: true, createdAt: true },
  })

  return NextResponse.json({ staff }, { status: 201 })
}
