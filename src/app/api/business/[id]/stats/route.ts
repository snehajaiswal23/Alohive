import { NextRequest } from "next/server"
import { requireBusinessMember } from "@/lib/api-auth"
import { getDashboardStats } from "@/lib/dashboard-stats"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/stats">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const stats = await getDashboardStats(id)
  return Response.json(stats)
}
