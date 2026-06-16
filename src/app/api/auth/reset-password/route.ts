import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()
  if (!token || !password) return Response.json({ error: "Token and password required" }, { status: 400 })
  // TODO: verify reset token, hash new password, update DB
  return Response.json({ success: true })
}
