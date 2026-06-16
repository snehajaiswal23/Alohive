import { NextRequest } from "next/server"
import { createHmac } from "crypto"

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-razorpay-signature") ?? ""
  const body = await req.text()
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? ""

  const expected = createHmac("sha256", secret).update(body).digest("hex")
  if (signature !== expected) {
    return Response.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(body)
  const eventType = event.event

  // TODO: handle subscription.activated, subscription.charged, subscription.halted, payment.failed
  switch (eventType) {
    case "subscription.activated":
    case "subscription.charged":
    case "subscription.halted":
    case "payment.failed":
      break
  }

  return Response.json({ received: true })
}
