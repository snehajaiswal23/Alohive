import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { messageId, status, timestamp } = body
  // TODO: update whatsapp_messages.status for messageId (sent/delivered/read/failed)
  return Response.json({ received: true, messageId, status })
}
