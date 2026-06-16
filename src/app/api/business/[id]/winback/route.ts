import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/business/[id]/winback">) {
  const { id } = await ctx.params
  return Response.json({ businessId: id, campaigns: [] })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/winback">) {
  const { id } = await ctx.params
  const body = await req.json()
  if (!body.name || !body.triggerDays) return Response.json({ error: "name and triggerDays required" }, { status: 400 })
  return Response.json({ id: "camp_new", businessId: id, status: "draft", ...body }, { status: 201 })
}
