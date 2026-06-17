import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-session"
import { writeAdminAudit, getClientIp } from "@/lib/admin-audit"

type Ctx = { params: Promise<{ id: string }> }

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) throw new Error("Unauthorized")
  return verifyAdminSession(token)
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try { await requireAdmin(req) } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const { id } = await ctx.params
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      subscription: true,
      _count: { select: { customers: true, visits: true, whatsappMessages: true, googleReviews: true } },
    },
  })
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(business)
}

export async function POST(req: NextRequest, ctx: Ctx) {
  let admin
  try { admin = await requireAdmin(req) } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const { id } = await ctx.params
  const { action, plan } = await req.json() as { action: string; plan?: string }
  const ip = getClientIp(req)

  const business = await prisma.business.findUnique({ where: { id } })
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (action === "suspend") {
    await prisma.business.update({ where: { id }, data: { status: "suspended" } })
    await writeAdminAudit({ adminEmail: admin.email, action: "Business suspended", detail: `${business.name} (${id})`, ip, businessId: id })
    return NextResponse.json({ success: true })
  }

  if (action === "reactivate") {
    await prisma.business.update({ where: { id }, data: { status: "active" } })
    await writeAdminAudit({ adminEmail: admin.email, action: "Business reactivated", detail: `${business.name} (${id})`, ip, businessId: id })
    return NextResponse.json({ success: true })
  }

  if (action === "change_plan" && plan) {
    await prisma.business.update({ where: { id }, data: { plan } })
    await writeAdminAudit({ adminEmail: admin.email, action: "Plan changed", detail: `${business.name}: ${business.plan} → ${plan}`, ip, businessId: id })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
