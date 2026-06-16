import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return Response.json({ error: "Email required" }, { status: 400 })
  // TODO: send reset email via Resend
  return Response.json({ success: true, message: "Reset link sent if email exists" })
}
