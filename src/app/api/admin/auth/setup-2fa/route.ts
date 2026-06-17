import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-session"
import { generateTotpSecret, totpUri, verifyTotp } from "@/lib/totp"
import { writeAdminAudit, getClientIp } from "@/lib/admin-audit"

async function getAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null
  try {
    const payload = await verifyAdminSession(token)
    return await prisma.adminUser.findUnique({ where: { id: payload.adminId } })
  } catch {
    return null
  }
}

/** GET — generate a new TOTP secret (not saved yet, returned for QR display) */
export async function GET(req: NextRequest) {
  const admin = await getAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // If already enabled, return current status
  if (admin.totpEnabled) {
    return NextResponse.json({ alreadyEnabled: true })
  }

  const secret = generateTotpSecret()
  // Temporarily store the secret in DB as pending (not enabled yet)
  await prisma.adminUser.update({ where: { id: admin.id }, data: { totpSecret: secret } })

  return NextResponse.json({
    secret,
    uri: totpUri(secret, admin.email),
  })
}

/** POST — verify code and mark 2FA as enabled */
export async function POST(req: NextRequest) {
  const admin = await getAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { code } = await req.json() as { code?: string }
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 })

  if (!admin.totpSecret) {
    return NextResponse.json({ error: "Start setup first (GET /api/admin/auth/setup-2fa)" }, { status: 400 })
  }

  if (!verifyTotp(admin.totpSecret, code)) {
    return NextResponse.json({ error: "Incorrect code. Scan the QR again or check your clock." }, { status: 400 })
  }

  await prisma.adminUser.update({ where: { id: admin.id }, data: { totpEnabled: true } })
  await writeAdminAudit({
    adminEmail: admin.email,
    action: "2FA enabled",
    detail: "TOTP successfully configured",
    ip: getClientIp(req),
  })

  return NextResponse.json({ success: true })
}

/** DELETE — disable 2FA (requires current TOTP code as proof) */
export async function DELETE(req: NextRequest) {
  const admin = await getAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { code } = await req.json() as { code?: string }
  if (!code) return NextResponse.json({ error: "Current code required to disable 2FA" }, { status: 400 })

  if (!admin.totpSecret || !verifyTotp(admin.totpSecret, code)) {
    return NextResponse.json({ error: "Incorrect code" }, { status: 401 })
  }

  await prisma.adminUser.update({ where: { id: admin.id }, data: { totpEnabled: false, totpSecret: null } })
  await writeAdminAudit({
    adminEmail: admin.email,
    action: "2FA disabled",
    detail: "Admin disabled TOTP authentication",
    ip: getClientIp(req),
  })

  return NextResponse.json({ success: true })
}
