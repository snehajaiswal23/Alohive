import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/business/[id]/subscription">) {
  const { id } = await ctx.params
  return Response.json({ businessId: id, plan: "growth", status: "active", currentPeriodEnd: "2025-07-15" })
}
