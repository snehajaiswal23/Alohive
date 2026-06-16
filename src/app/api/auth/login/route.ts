import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, signSession, SESSION_COOKIE } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email }, include: { business: true } })
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })

  const token = await signSession({ userId: user.id, businessId: user.businessId, role: user.role })

  const res = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    business: { id: user.business.id, name: user.business.name },
  })

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  return res
}
