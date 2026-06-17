import { NextRequest, NextResponse } from "next/server"
import { verifySession, SESSION_COOKIE } from "@/lib/session"

export async function requireBusinessMember(req: NextRequest, businessId: string) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const
  }

  let session
  try {
    session = await verifySession(token)
  } catch {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const
  }

  if (session.businessId !== businessId) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) } as const
  }

  return { session } as const
}

export async function requireOwner(req: NextRequest, businessId: string) {
  const result = await requireBusinessMember(req, businessId)
  if (result.error) return result

  if (result.session.role !== "owner") {
    return { error: NextResponse.json({ error: "Owner access required" }, { status: 403 }) } as const
  }

  return result
}
