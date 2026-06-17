import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember } from "@/lib/api-auth"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/visits/today">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const visits = await prisma.visit.findMany({
    where: { businessId: id, visitedAt: { gte: startOfDay } },
    orderBy: { visitedAt: "desc" },
    include: {
      customer: { select: { id: true, name: true, phone: true, loyaltyTier: true, loyaltyPoints: true } },
      staff:    { select: { id: true, name: true } },
    },
  })

  return Response.json({ count: visits.length, visits })
}
