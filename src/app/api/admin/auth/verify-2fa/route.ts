import { NextRequest, NextResponse } from "next/server"
import {
  verifyAdminChallenge,
  signAdminSession,
  ADMIN_SESSION_COOKIE,
  ADMIN_CHALLENGE_COOKIE,
} from "@/lib/admin-session"
import { verifyTotp } from "@/lib/totp"
import { prisma } from "@/lib/prisma"
import { writeAdminAudit, getClientIp } from "@/lib/admin-audit"

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export async function POST(req: NextRequest) {
  const challengeToken = req.cookies.get(ADMIN_CHALLENGE_COOKIE)?.value
  if (!challengeToken) {
    return NextResponse.json({ error: "No active 2FA challenge" }, { status: 401 })
  }

  let challenge
  try {
    challenge = await verifyAdminChallenge(challengeToken)
  } catch {
    return NextResponse.json({ error: "Challenge expired — please log in again" }, { status: 401 })
  }

  const { code } = await req.json() as { code?: string }
  if (!code || code.replace(/\s/g, "").length !== 6) {
    return NextResponse.json({ error: "Enter the 6-digit code from your authenticator app" }, { status: 400 })
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: challenge.adminId } })
  if (!admin?.totpSecret) {
    return NextResponse.json({ error: "2FA not configured for this account" }, { status: 400 })
  }

  const ip = getClientIp(req)
  if (!verifyTotp(admin.totpSecret, code)) {
    await writeAdminAudit({ adminEmail: admin.email, action: "Admin 2FA failed", detail: `Bad TOTP code from ${ip}`, ip })
    return NextResponse.json({ error: "Incorrect code. Try again." }, { status: 401 })
  }

  const token = await signAdminSession({ adminId: admin.id, email: admin.email, name: admin.name })
  await writeAdminAudit({ adminEmail: admin.email, action: "Admin login", detail: "2FA verified, session issued", ip })

  const res = NextResponse.json({ success: true })
  res.cookies.set(ADMIN_SESSION_COOKIE, token, { ...COOKIE_BASE, maxAge: 60 * 60 * 8 })
  res.cookies.delete(ADMIN_CHALLENGE_COOKIE)
  return res
}
