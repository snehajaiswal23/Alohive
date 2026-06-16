import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/business/[id]/visits">) {
  const { id } = await ctx.params
  // TODO: paginated list of visits for business
  return Response.json({ businessId: id, visits: [], total: 0 })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/visits">) {
  const { id } = await ctx.params
  const body = await req.json()
  const { customerId, staffId, service, billAmount } = body

  if (!customerId) return Response.json({ error: "customerId required" }, { status: 400 })

  // TODO: create visit, award loyalty points, queue WA message
  return Response.json({
    id: "visit_new",
    businessId: id,
    customerId,
    staffId,
    service,
    billAmount,
    visitedAt: new Date().toISOString(),
    pointsAwarded: 10,
    whatsappScheduledIn: 1800,
  }, { status: 201 })
}
