import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password, name, businessName, businessType, city, locality, whatsappNumber } = body

  if (!email || !password || !name || !businessName) {
    return Response.json({ error: "Missing required fields" }, { status: 400 })
  }

  // TODO: hash password, create Business + User in DB, send OTP
  return Response.json({
    success: true,
    message: "Account created. Please verify your phone.",
    businessId: "biz_placeholder",
  }, { status: 201 })
}
