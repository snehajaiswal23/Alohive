interface ReplyContext {
  businessName: string
  reviewerName: string
  rating: number
  reviewText: string | null
}

function fallbackReply(ctx: ReplyContext): string {
  const first = ctx.reviewerName.split(" ")[0]
  if (ctx.rating >= 5) {
    return `Hi ${first}, thank you so much for the wonderful review! We're thrilled you had a great experience at ${ctx.businessName} and can't wait to see you again.`
  }
  if (ctx.rating >= 3) {
    const textPart = ctx.reviewText
      ? " We've taken note of your feedback and are working on it."
      : ""
    return `Hi ${first}, thank you for taking the time to share your feedback.${textPart} We hope to exceed your expectations on your next visit to ${ctx.businessName}.`
  }
  return `Hi ${first}, we're truly sorry your experience at ${ctx.businessName} didn't meet expectations. We take all feedback seriously and would love the chance to make this right — please reach out to us directly so we can address your concerns personally.`
}

export async function generateReviewReply(ctx: ReplyContext): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return fallbackReply(ctx)

  const toneGuide =
    ctx.rating >= 5
      ? "warm, grateful, and brief (2–3 sentences)"
      : ctx.rating >= 3
        ? "appreciative and constructive (3–4 sentences), acknowledge the feedback"
        : "sincere, apologetic, and resolution-focused (3–5 sentences); invite them to contact you directly"

  const prompt = [
    `You are the owner of "${ctx.businessName}" replying to a Google review.`,
    `The reviewer (${ctx.reviewerName}) gave a ${ctx.rating}-star rating.`,
    ctx.reviewText ? `Their review: "${ctx.reviewText}"` : "They left no written comment.",
    `Write a reply that is ${toneGuide}.`,
    "Do NOT use markdown, bullet points, or asterisks. Plain text only.",
    "Output JSON: { \"reply\": \"<reply text>\" }",
  ].join("\n")

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })
    if (!res.ok) return fallbackReply(ctx)
    const json = await res.json()
    const raw = json.choices?.[0]?.message?.content
    if (!raw) return fallbackReply(ctx)
    const parsed = JSON.parse(raw) as { reply?: string }
    return parsed.reply?.trim() || fallbackReply(ctx)
  } catch {
    return fallbackReply(ctx)
  }
}
