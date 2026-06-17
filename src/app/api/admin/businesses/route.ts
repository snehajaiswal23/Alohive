import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-session"

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) throw new Error("Unauthorized")
  return verifyAdminSession(token)
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q      = searchParams.get("q") ?? ""
  const page   = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit  = 20
  const skip   = (page - 1) * limit

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { city: { contains: q, mode: "insensitive" as const } },
          { type: { contains: q, mode: "insensitive" as const } },
          { phone: { contains: q } },
        ],
      }
    : {}

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        city: true,
        plan: true,
        status: true,
        phone: true,
        createdAt: true,
        _count: { select: { customers: true, visits: true } },
        subscription: { select: { status: true, razorpaySubscriptionId: true } },
      },
    }),
    prisma.business.count({ where }),
  ])

  return NextResponse.json({ businesses, total, page, pages: Math.ceil(total / limit) })
}
