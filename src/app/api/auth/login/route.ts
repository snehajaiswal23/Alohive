import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password } = body

  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 })
  }

  // TODO: verify credentials against DB, issue JWT/session
  return Response.json({
    token: "jwt_placeholder",
    user: { id: "u_1", email, role: "owner", name: "Priya Mehta" },
    business: { id: "biz_1", name: "Gloss Studio" },
  })
}
