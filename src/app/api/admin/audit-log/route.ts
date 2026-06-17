import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-session"

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try { await verifyAdminSession(token) } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const { searchParams } = new URL(req.url)
  const q     = searchParams.get("q") ?? ""
  const page  = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit = 50
  const skip  = (page - 1) * limit

  const where = q
    ? {
        OR: [
          { action: { contains: q, mode: "insensitive" as const } },
          { ipAddress: { contains: q } },
        ],
      }
    : {}

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        details: true,
        ipAddress: true,
        createdAt: true,
        businessId: true,
        business: { select: { name: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ])

  return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) })
}
