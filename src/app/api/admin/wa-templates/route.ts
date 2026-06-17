import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-session"
import { writeAdminAudit, getClientIp } from "@/lib/admin-audit"

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) throw new Error("Unauthorized")
  return verifyAdminSession(token)
}

/** GET — paginated list of all templates across all businesses */
export async function GET(req: NextRequest) {
  try { await requireAdmin(req) } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const { searchParams } = new URL(req.url)
  const businessId = searchParams.get("businessId")
  const status     = searchParams.get("status")

  const where: Record<string, unknown> = {}
  if (businessId) where.businessId = businessId
  if (status)     where.status     = status

  const templates = await prisma.whatsappTemplate.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { business: { select: { name: true } } },
  })

  return NextResponse.json(templates)
}

/** POST — admin creates/updates a global template */
export async function POST(req: NextRequest) {
  let admin
  try { admin = await requireAdmin(req) } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const body = await req.json() as {
    businessId: string
    name: string
    body: string
    category?: string
    language?: string
  }

  const template = await prisma.whatsappTemplate.upsert({
    where: { businessId_name: { businessId: body.businessId, name: body.name } },
    create: {
      businessId: body.businessId,
      name: body.name,
      body: body.body,
      category: body.category ?? "Utility",
      language: body.language ?? "en",
      status: "pending",
    },
    update: { body: body.body, status: "pending" },
  })

  await writeAdminAudit({
    adminEmail: admin.email,
    action: "WA template saved",
    detail: `${body.name} for business ${body.businessId}`,
    ip: getClientIp(req),
    businessId: body.businessId,
  })

  return NextResponse.json(template)
}
