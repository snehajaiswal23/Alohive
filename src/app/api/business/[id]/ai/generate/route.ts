import { NextRequest } from "next/server"

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/ai/generate">) {
  const { id } = await ctx.params
  const { prompt, tone, language } = await req.json()
  if (!prompt) return Response.json({ error: "prompt required" }, { status: 400 })

  // TODO: call OpenAI/Claude API with business context
  return Response.json({
    businessId: id,
    whatsapp: `Hi {name}! 🎉 ${prompt}\n\nReply YES to claim or STOP to opt out.`,
    instagram: `✨ ${prompt} ✨\n\nBook via link in bio. Limited slots! #Salon #Bangalore`,
    sms: `${prompt} - Reply YES to book.`,
    poster: prompt.toUpperCase(),
  })
}
