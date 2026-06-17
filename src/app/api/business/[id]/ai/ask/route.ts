import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember } from "@/lib/api-auth"

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/ai/ask">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const { question } = await req.json()
  if (!question) return NextResponse.json({ error: "question required" }, { status: 400 })

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI assistant is not configured (missing OPENAI_API_KEY)" }, { status: 503 })
  }

  // Gather live business context for grounding
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const [business, stats30, topCustomers, winbacks, avgFeedback] = await Promise.all([
    prisma.business.findUnique({ where: { id }, select: { name: true, type: true, city: true, plan: true } }),
    prisma.visit.aggregate({ where: { businessId: id, visitedAt: { gte: since30 } }, _count: { id: true }, _sum: { billAmount: true } }),
    prisma.customer.findMany({ where: { businessId: id }, orderBy: { totalVisits: "desc" }, take: 5, select: { name: true, totalVisits: true, loyaltyTier: true } }),
    prisma.winBackTarget.count({ where: { businessId: id } }),
    prisma.feedback.aggregate({ where: { businessId: id, createdAt: { gte: since30 } }, _avg: { score: true }, _count: { id: true } }),
  ])

  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const context = `
Business: ${business.name} (${business.type}) in ${business.city}, plan: ${business.plan}
Last 30 days: ${stats30._count.id} visits, ₹${(stats30._sum.billAmount ?? 0).toLocaleString("en-IN")} revenue
Feedback: avg ${(avgFeedback._avg.score ?? 0).toFixed(1)}/5 from ${avgFeedback._count.id} responses
Win-back targets: ${winbacks} inactive customers
Top customers: ${topCustomers.map((c) => `${c.name} (${c.totalVisits} visits, ${c.loyaltyTier})`).join(", ")}
`.trim()

  const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful business growth advisor for a ${business.type} in India. Answer questions concisely using the provided business data. Focus on actionable recommendations. Respond in 2-4 sentences.`,
        },
        {
          role: "user",
          content: `Business context:\n${context}\n\nQuestion: ${question}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  })

  if (!openAiRes.ok) {
    return NextResponse.json({ error: "AI request failed" }, { status: 502 })
  }

  const data = await openAiRes.json()
  const answer = data.choices?.[0]?.message?.content ?? "Unable to generate a response."

  return NextResponse.json({ answer, context: { visits: stats30._count.id, winbacks } })
}
