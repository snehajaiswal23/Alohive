import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  // TODO: create business in DB (called during signup)
  return Response.json({ id: "biz_new", ...body }, { status: 201 })
}
