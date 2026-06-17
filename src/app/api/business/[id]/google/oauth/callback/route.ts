import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/api-auth"
import { exchangeCodeForTokens, getRedirectUri } from "@/lib/google/oauth"
import { fetchFirstAccountId, fetchFirstLocationId } from "@/lib/google/business-profile"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/google/oauth/callback">) {
  const { id } = await ctx.params
  const dashboardUrl = new URL("/dashboard/reviews", req.nextUrl.origin)

  const { error } = await requireOwner(req, id)
  if (error) return error

  const { searchParams } = req.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const googleError = searchParams.get("error")

  if (googleError) {
    dashboardUrl.searchParams.set("google", "error")
    dashboardUrl.searchParams.set("message", googleError)
    return NextResponse.redirect(dashboardUrl)
  }

  if (!code || state !== id) {
    dashboardUrl.searchParams.set("google", "error")
    dashboardUrl.searchParams.set("message", "Invalid OAuth callback")
    return NextResponse.redirect(dashboardUrl)
  }

  const tokenResult = await exchangeCodeForTokens(code, getRedirectUri(id))
  if (!tokenResult.ok || !tokenResult.data.refreshToken) {
    dashboardUrl.searchParams.set("google", "error")
    dashboardUrl.searchParams.set("message", tokenResult.ok ? "No refresh token returned" : tokenResult.error)
    return NextResponse.redirect(dashboardUrl)
  }

  const { accessToken, refreshToken, expiresAt } = tokenResult.data

  const accountResult = await fetchFirstAccountId(accessToken)
  const accountId = accountResult.ok ? accountResult.data : null
  const locationResult = accountId ? await fetchFirstLocationId(accessToken, accountId) : null
  const locationId = locationResult?.ok ? locationResult.data : null

  await prisma.googleOAuthConfig.upsert({
    where: { businessId: id },
    create: {
      businessId: id,
      accessToken,
      refreshToken,
      expiresAt,
      accountId,
      locationId,
      isConnected: true,
      connectedAt: new Date(),
      lastError: accountId ? null : accountResult.ok ? null : accountResult.error,
    },
    update: {
      accessToken,
      refreshToken,
      expiresAt,
      accountId,
      locationId,
      isConnected: true,
      connectedAt: new Date(),
      lastError: accountId ? null : accountResult.ok ? null : accountResult.error,
    },
  })

  dashboardUrl.searchParams.set("google", "connected")
  return NextResponse.redirect(dashboardUrl)
}
