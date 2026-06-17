import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-session"
import { writeAdminAudit, getClientIp } from "@/lib/admin-audit"

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) throw new Error("Unauthorized")
  return verifyAdminSession(token)
}

export async function GET(req: NextRequest) {
  try { await requireAdmin(req) } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const flags = await prisma.featureFlag.findMany({ orderBy: { key: "asc" } })
  return NextResponse.json(flags)
}

export async function POST(req: NextRequest) {
  let admin
  try { admin = await requireAdmin(req) } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const body = await req.json() as { key: string; isEnabled: boolean; enabledFor?: string }
  const { key, isEnabled, enabledFor } = body

  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 })

  const flag = await prisma.featureFlag.update({
    where: { key },
    data: {
      isEnabled,
      ...(enabledFor !== undefined ? { enabledFor } : {}),
      updatedBy: admin.email,
    },
  })

  await writeAdminAudit({
    adminEmail: admin.email,
    action: "Feature flag toggled",
    detail: `${key} → ${isEnabled ? "enabled" : "disabled"}${enabledFor ? ` (scope: ${enabledFor})` : ""}`,
    ip: getClientIp(req),
  })

  return NextResponse.json(flag)
}
