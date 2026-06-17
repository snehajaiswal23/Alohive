const GUPSHUP_BASE = "https://api.gupshup.io"

type GupshupResult<T> = { ok: true; data: T } | { ok: false; error: string }

export async function checkWalletBalance(apiKey: string): Promise<GupshupResult<{ balance: number }>> {
  try {
    const res = await fetch(`${GUPSHUP_BASE}/sm/api/v2/wallet/balance`, {
      headers: { apikey: apiKey },
    })
    if (!res.ok) {
      const text = await res.text()
      return { ok: false, error: `Gupshup rejected the API key (${res.status}): ${text}` }
    }
    const data = await res.json()
    return { ok: true, data: { balance: data.balance ?? 0 } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error reaching Gupshup" }
  }
}

interface SendTemplateMessageInput {
  apiKey: string
  sourceNumber: string
  appName?: string | null
  destination: string
  templateId: string
  params: string[]
}

interface SendTextMessageInput {
  apiKey: string
  sourceNumber: string
  appName?: string | null
  destination: string
  text: string
}

export async function sendTextMessage(
  input: SendTextMessageInput,
): Promise<GupshupResult<{ messageId: string }>> {
  const body = new URLSearchParams({
    channel: "whatsapp",
    source: input.sourceNumber,
    destination: input.destination,
    message: JSON.stringify({ type: "text", text: input.text }),
  })
  if (input.appName) body.set("src.name", input.appName)

  try {
    const res = await fetch(`${GUPSHUP_BASE}/wa/api/v1/msg`, {
      method: "POST",
      headers: { apikey: input.apiKey, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: data.message || `Gupshup send failed (${res.status})` }
    }
    return { ok: true, data: { messageId: data.messageId } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error reaching Gupshup" }
  }
}

export async function sendTemplateMessage(
  input: SendTemplateMessageInput,
): Promise<GupshupResult<{ messageId: string }>> {
  const body = new URLSearchParams({
    channel: "whatsapp",
    source: input.sourceNumber,
    destination: input.destination,
    template: JSON.stringify({ id: input.templateId, params: input.params }),
  })
  if (input.appName) body.set("src.name", input.appName)

  try {
    const res = await fetch(`${GUPSHUP_BASE}/wa/api/v1/template/msg`, {
      method: "POST",
      headers: { apikey: input.apiKey, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: data.message || `Gupshup send failed (${res.status})` }
    }
    return { ok: true, data: { messageId: data.messageId } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error reaching Gupshup" }
  }
}
