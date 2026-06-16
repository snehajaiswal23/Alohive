import { NextRequest } from "next/server"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/customers">) {
  const { id } = await ctx.params
  const { searchParams } = new URL(req.url)
  const filter = searchParams.get("filter") ?? "all"
  const q = searchParams.get("q") ?? ""
  // TODO: fetch customers with filter/search, paginated
  return Response.json({ businessId: id, filter, q, customers: [], total: 0 })
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/customers">) {
  const { id } = await ctx.params
  const body = await req.json()
  if (!body.phone) return Response.json({ error: "Phone required" }, { status: 400 })
  // TODO: create or upsert customer
  return Response.json({ id: "cust_new", businessId: id, ...body }, { status: 201 })
}
