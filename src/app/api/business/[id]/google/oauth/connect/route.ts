import { NextRequest, NextResponse } from "next/server"
import { requireOwner } from "@/lib/api-auth"
import { buildAuthUrl, getRedirectUri } from "@/lib/google/oauth"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/google/oauth/connect">) {
  const { id } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const authUrl = buildAuthUrl(id, getRedirectUri(id))
  return NextResponse.redirect(authUrl)
}
