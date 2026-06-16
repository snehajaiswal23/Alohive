import { NextRequest } from "next/server"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/analytics/revenue">) {
  const { id } = await ctx.params
  const period = new URL(req.url).searchParams.get("period") ?? "30d"
  // TODO: aggregate revenue from visits grouped by period
  return Response.json({
    businessId: id,
    period,
    monthly: [
      { month: "Jan", revenue: 82000 },
      { month: "Feb", revenue: 91000 },
      { month: "Mar", revenue: 88000 },
      { month: "Apr", revenue: 97000 },
      { month: "May", revenue: 103000 },
      { month: "Jun", revenue: 102000 },
    ],
    totalMTD: 102000,
    growthPct: 12,
  })
}
