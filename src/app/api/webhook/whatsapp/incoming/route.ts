import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { from, text, timestamp } = body

  // TODO:
  // 1. Look up customer by phone number
  // 2. Check if this is a feedback reply (1-5) or text
  // 3. If rating >= 4: send Google review link, award points
  // 4. If rating <= 3: capture privately, alert owner
  // 5. Handle loyalty/referral replies
  // 6. Log message in whatsapp_messages table

  return Response.json({ received: true, from })
}

export async function GET(req: NextRequest) {
  // Gupshup webhook verification
  const { searchParams } = new URL(req.url)
  const challenge = searchParams.get("hub.challenge")
  if (challenge) return new Response(challenge)
  return Response.json({ status: "ok" })
}
