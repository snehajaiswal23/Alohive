import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifySession, signSession, SESSION_COOKIE } from "@/lib/session"

export async function GET(req: NextRequest) {
  const then = req.nextUrl.searchParams.get("then") ?? "/dashboard"
  // Guard against open redirect — only allow same-origin relative paths
  const safeThen = then.startsWith("/") && !then.startsWith("//") ? then : "/dashboard"

  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    const payload = await verifySession(token)
    const business = await prisma.business.findUnique({
      where: { id: payload.businessId },
      select: { plan: true },
    })

    const newToken = await signSession({
      userId: payload.userId,
      businessId: payload.businessId,
      role: payload.role,
      plan: business?.plan ?? "trial",
    })

    const response = NextResponse.redirect(new URL(safeThen, req.url))
    response.cookies.set(SESSION_COOKIE, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
    return response
  } catch {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}
