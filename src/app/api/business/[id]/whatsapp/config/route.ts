import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember, requireOwner } from "@/lib/api-auth"
import { checkWalletBalance } from "@/lib/whatsapp/gupshup"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/whatsapp/config">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const config = await prisma.whatsappConfig.findUnique({ where: { businessId: id } })
  if (!config) return NextResponse.json({ config: null })

  return NextResponse.json({
    config: {
      provider: config.provider,
      appName: config.appName,
      isConnected: config.isConnected,
      connectedAt: config.connectedAt,
      lastError: config.lastError,
      apiKeyMasked: `••••${config.apiKey.slice(-4)}`,
    },
  })
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/business/[id]/whatsapp/config">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const { apiKey, appName } = await req.json()
  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 })
  }

  const check = await checkWalletBalance(apiKey)

  const config = await prisma.whatsappConfig.upsert({
    where: { businessId: id },
    create: {
      businessId: id,
      apiKey,
      appName: appName || null,
      isConnected: check.ok,
      connectedAt: check.ok ? new Date() : null,
      lastError: check.ok ? null : check.error,
    },
    update: {
      apiKey,
      appName: appName || null,
      isConnected: check.ok,
      connectedAt: check.ok ? new Date() : null,
      lastError: check.ok ? null : check.error,
    },
  })

  return NextResponse.json({
    config: {
      provider: config.provider,
      appName: config.appName,
      isConnected: config.isConnected,
      connectedAt: config.connectedAt,
      lastError: config.lastError,
      apiKeyMasked: `••••${config.apiKey.slice(-4)}`,
    },
  })
}
