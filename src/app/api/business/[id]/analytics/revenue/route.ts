import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember } from "@/lib/api-auth"

type Ctx = { params: Promise<{ id: string }> }

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const months = Math.min(24, Math.max(1, parseInt(new URL(req.url).searchParams.get("months") ?? "12")))
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const windowStart = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)

  const rows = await prisma.$queryRaw<{ month: Date; revenue: string; visits: string }[]>`
    SELECT
      DATE_TRUNC('month', "visitedAt") AS month,
      COALESCE(SUM("billAmount"), 0)::text AS revenue,
      COUNT(*)::text AS visits
    FROM "Visit"
    WHERE "businessId" = ${id}
      AND "visitedAt" >= ${windowStart}
    GROUP BY DATE_TRUNC('month', "visitedAt")
    ORDER BY month ASC
  `

  const monthly = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const match = rows.find((r) => {
      const rm = new Date(r.month)
      return rm.getFullYear() === d.getFullYear() && rm.getMonth() === d.getMonth()
    })
    monthly.push({
      month: `${MONTH_LABELS[d.getMonth()]} '${d.getFullYear().toString().slice(2)}`,
      revenue: match ? Math.round(parseFloat(match.revenue)) : 0,
      visits: match ? parseInt(match.visits) : 0,
    })
  }

  const mtd = await prisma.visit.aggregate({
    where: { businessId: id, visitedAt: { gte: startOfThisMonth }, billAmount: { not: null } },
    _sum: { billAmount: true },
  })

  return Response.json({
    businessId: id,
    monthly,
    totalMTD: Math.round(Number(mtd._sum.billAmount ?? 0)),
  })
}
