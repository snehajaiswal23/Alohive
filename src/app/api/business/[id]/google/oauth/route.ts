import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember, requireOwner } from "@/lib/api-auth"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/google/oauth">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const config = await prisma.googleOAuthConfig.findUnique({ where: { businessId: id } })
  if (!config) return NextResponse.json({ config: null })

  return NextResponse.json({
    config: {
      isConnected: config.isConnected,
      connectedAt: config.connectedAt,
      lastSyncedAt: config.lastSyncedAt,
      lastError: config.lastError,
    },
  })
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/business/[id]/google/oauth">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  await prisma.googleOAuthConfig.deleteMany({ where: { businessId: id } })
  return NextResponse.json({ disconnected: true })
}
