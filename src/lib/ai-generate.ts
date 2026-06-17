export interface BusinessContext {
  name: string
  type: string
  city: string
}

export type Tone = "professional" | "casual" | "festive"
export type Language = "english" | "hindi" | "hinglish"

export interface GeneratedContent {
  whatsapp: string
  instagram: string
  sms: string
}

const TONE_LABELS: Record<Tone, string> = {
  professional: "professional and polished",
  casual: "friendly and conversational",
  festive: "exciting, celebratory, and energetic",
}

const LANG_LABELS: Record<Language, string> = {
  english: "English",
  hindi: "pure Hindi",
  hinglish: "Hinglish — a natural mix of Hindi and English as used in Indian WhatsApp chats",
}

function fallbackContent(business: BusinessContext, prompt: string): GeneratedContent {
  const tag = business.city.replace(/\s+/g, "")
  const type = business.type.charAt(0).toUpperCase() + business.type.slice(1)
  return {
    whatsapp: `Hi {name}! 🎉 ${prompt}\n\nReply YES to claim your offer, or STOP to unsubscribe. — ${business.name}`,
    instagram: `✨ ${prompt} ✨\n\nBook via the link in bio. Limited slots available!\n\n#${tag} #${type} #Beauty #BookNow`,
    sms: `${business.name}: ${prompt} Reply YES to book. T&C apply.`.slice(0, 160),
  }
}

export async function generateMarketingContent(
  business: BusinessContext,
  prompt: string,
  tone: Tone,
  language: Language,
): Promise<GeneratedContent> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return fallbackContent(business, prompt)
  }

  const systemPrompt = `You are a senior marketing copywriter for ${business.type} businesses in India.
You write campaigns for ${business.name}, a ${business.type} in ${business.city}.

Generate THREE pieces of content from the owner's promotion description:

1. **WhatsApp message**:
   - Use {name} as the only placeholder for the customer's first name
   - 1-2 relevant emojis maximum
   - Max 300 characters
   - Clear CTA at the end ("Reply YES to book", "Call us now", "Visit us today", etc.)
   - Sound personal, not like a bulk broadcast

2. **Instagram caption**:
   - 150–250 characters
   - Visual and engaging, reads well on a social feed
   - 3–5 relevant Indian city/industry hashtags at the end
   - No placeholder variables

3. **SMS**:
   - Max 160 characters, plain text only (no emojis, no bold, no {placeholders})
   - Start with business name
   - One clear CTA

Tone: ${TONE_LABELS[tone]}
Language: ${LANG_LABELS[language]}

Output ONLY valid JSON — no markdown, no explanation:
{"whatsapp":"...","instagram":"...","sms":"..."}`

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
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Promotion: ${prompt}` },
        ],
        max_tokens: 700,
        temperature: 0.75,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(
        (err as { error?: { message?: string } }).error?.message ||
          `OpenAI API error (${res.status})`,
      )
    }

    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const raw = data.choices?.[0]?.message?.content
    if (!raw) throw new Error("Empty response from OpenAI")

    const parsed = JSON.parse(raw) as Partial<GeneratedContent>
    return {
      whatsapp: parsed.whatsapp?.trim() || "",
      instagram: parsed.instagram?.trim() || "",
      sms: (parsed.sms?.trim() || "").slice(0, 160),
    }
  } catch (e) {
    // If API key is wrong / quota exceeded, fall back to template placeholders
    // so the UI still works without breaking
    console.error("AI generation failed, using fallback:", e)
    return fallbackContent(business, prompt)
  }
}
