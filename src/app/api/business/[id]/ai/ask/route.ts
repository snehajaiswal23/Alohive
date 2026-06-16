import { NextRequest } from "next/server"

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/ai/ask">) {
  const { id } = await ctx.params
  const { question } = await req.json()
  if (!question) return Response.json({ error: "question required" }, { status: 400 })

  // TODO: gather business context from DB, call LLM, return answer with optional chart data
  return Response.json({
    businessId: id,
    question,
    answer: "Based on your last 30 days of data, I recommend focusing on re-engaging your Silver-tier customers who haven't visited in 20+ days.",
    suggestions: ["Run a win-back campaign", "Offer a 15% discount this weekend"],
  })
}
