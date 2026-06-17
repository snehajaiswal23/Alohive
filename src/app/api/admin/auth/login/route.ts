import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth"
import {
  signAdminSession,
  signAdminChallenge,
  ADMIN_SESSION_COOKIE,
  ADMIN_CHALLENGE_COOKIE,
} from "@/lib/admin-session"
import { writeAdminAudit, getClientIp } from "@/lib/admin-audit"

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json() as { email?: string; password?: string }
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  }

  const ip = getClientIp(req)
  const admin = await prisma.adminUser.findUnique({ where: { email } })

  // Constant-time rejection — don't reveal whether the email exists
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    await writeAdminAudit({ adminEmail: email, action: "Admin login failed", detail: `Invalid credentials from ${ip}`, ip })
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLogin: new Date() } })

  // If 2FA is not yet enrolled, issue a real session directly.
  // This lets admins log in before they've set up their authenticator app.
  if (!admin.totpEnabled) {
    const token = await signAdminSession({ adminId: admin.id, email: admin.email, name: admin.name })
    await writeAdminAudit({ adminEmail: email, action: "Admin login", detail: "Password login (2FA not enrolled)", ip })
    const res = NextResponse.json({ success: true, requires2FA: false })
    res.cookies.set(ADMIN_SESSION_COOKIE, token, { ...COOKIE_BASE, maxAge: 60 * 60 * 8 })
    return res
  }

  // 2FA enrolled — issue a short-lived challenge token, UI shows TOTP input
  const challenge = await signAdminChallenge({ adminId: admin.id, email: admin.email, challenge: true })
  const res = NextResponse.json({ success: true, requires2FA: true })
  res.cookies.set(ADMIN_CHALLENGE_COOKIE, challenge, { ...COOKIE_BASE, maxAge: 60 * 5 })
  return res
}
