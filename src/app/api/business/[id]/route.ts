import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/business/[id]">) {
  const { id } = await ctx.params
  // TODO: fetch business from DB, verify ownership
  return Response.json({ id, name: "Gloss Studio", type: "Salon", city: "Bangalore" })
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/business/[id]">) {
  const { id } = await ctx.params
  const body = await req.json()
  // TODO: update business fields in DB
  return Response.json({ id, ...body })
}
