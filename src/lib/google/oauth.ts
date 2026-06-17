import { prisma } from "@/lib/prisma"

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const SCOPE = "https://www.googleapis.com/auth/business.manage"

type GoogleResult<T> = { ok: true; data: T } | { ok: false; error: string }

export function getRedirectUri(businessId: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/business/${businessId}/google/oauth/callback`
}

export function buildAuthUrl(businessId: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state: businessId,
  })
  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

interface TokenResult {
  accessToken: string
  refreshToken?: string
  expiresAt: Date
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<GoogleResult<TokenResult>> {
  try {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: data.error_description || data.error || `Google token exchange failed (${res.status})` }
    }
    return {
      ok: true,
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error reaching Google" }
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleResult<TokenResult>> {
  try {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        grant_type: "refresh_token",
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: data.error_description || data.error || `Google token refresh failed (${res.status})` }
    }
    return {
      ok: true,
      data: {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error reaching Google" }
  }
}

export async function getValidAccessToken(businessId: string): Promise<GoogleResult<string>> {
  const config = await prisma.googleOAuthConfig.findUnique({ where: { businessId } })
  if (!config || !config.isConnected) {
    return { ok: false, error: "Google Business Profile is not connected" }
  }

  if (config.expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
    return { ok: true, data: config.accessToken }
  }

  const refreshResult = await refreshAccessToken(config.refreshToken)
  if (!refreshResult.ok) {
    await prisma.googleOAuthConfig.update({
      where: { businessId },
      data: { isConnected: false, lastError: `Token refresh failed: ${refreshResult.error}` },
    })
    return { ok: false, error: refreshResult.error }
  }

  await prisma.googleOAuthConfig.update({
    where: { businessId },
    data: {
      accessToken: refreshResult.data.accessToken,
      expiresAt: refreshResult.data.expiresAt,
    },
  })

  return { ok: true, data: refreshResult.data.accessToken }
}
