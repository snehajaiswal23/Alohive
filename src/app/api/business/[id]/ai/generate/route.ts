import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/api-auth"
import { generateMarketingContent, type Tone, type Language } from "@/lib/ai-generate"

export async function POST(req: NextRequest, ctx: RouteContext<"/api/business/[id]/ai/generate">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const body = await req.json() as { prompt?: string; tone?: Tone; language?: Language }
  const { prompt, tone = "casual", language = "english" } = body

  if (!prompt?.trim()) {
    return Response.json({ error: "prompt is required" }, { status: 400 })
  }

  const business = await prisma.business.findUnique({
    where: { id },
    select: { name: true, type: true, city: true },
  })
  if (!business) return Response.json({ error: "Business not found" }, { status: 404 })

  const content = await generateMarketingContent(
    { name: business.name, type: business.type, city: business.city },
    prompt.trim(),
    tone,
    language,
  )

  return Response.json(content)
}
