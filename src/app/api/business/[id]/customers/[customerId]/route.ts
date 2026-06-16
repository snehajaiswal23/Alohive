import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/business/[id]/customers/[customerId]">) {
  const { id, customerId } = await ctx.params
  return Response.json({ businessId: id, customerId, name: "Aditi Sharma", phone: "+91 98765 43210", loyaltyPoints: 1420, totalVisits: 14 })
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/business/[id]/customers/[customerId]">) {
  const { id, customerId } = await ctx.params
  const body = await req.json()
  return Response.json({ businessId: id, customerId, ...body })
}
