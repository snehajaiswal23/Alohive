import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { canAccess, requiredPlanFor } from "@/lib/plan-access"
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session"

const userSecret   = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
const adminSecret  = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET ?? process.env.NEXTAUTH_SECRET)

// ── IP whitelist for /admin ───────────────────────────────────────────────────

function isAdminIpAllowed(req: NextRequest): boolean {
  const raw = process.env.ADMIN_IP_WHITELIST
  if (!raw) return true  // No list configured → allow all (dev mode)

  const allowed = raw.split(",").map((s) => s.trim()).filter(Boolean)
  if (allowed.length === 0) return true

  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    ""

  return allowed.includes(clientIp)
}

// ── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Public: login page + login API never need a session
    const isPublicAdminRoute =
      pathname === "/admin/login" ||
      pathname.startsWith("/api/admin/auth/login") ||
      pathname.startsWith("/api/admin/auth/verify-2fa")

    // IP whitelist — checked on every admin request including the login page
    if (!isAdminIpAllowed(request)) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    if (!isPublicAdminRoute) {
      const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
      if (!token) {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }
      try {
        await jwtVerify(token, adminSecret)
      } catch {
        const res = NextResponse.redirect(new URL("/admin/login", request.url))
        res.cookies.delete(ADMIN_SESSION_COOKIE)
        return res
      }
    }

    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // ── Dashboard routes ──────────────────────────────────────────────────────

  // Upgrade and billing are always accessible
  if (
    pathname.startsWith("/dashboard/upgrade") ||
    pathname.startsWith("/dashboard/billing")
  ) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  const token = request.cookies.get("alohive_session")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  let payload: { userId?: string; role?: string; plan?: string }
  try {
    const result = await jwtVerify(token, userSecret)
    payload = result.payload as typeof payload
  } catch {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (payload.role && payload.role !== "owner") {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (payload.plan === undefined) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  const gate = requiredPlanFor(pathname)
  if (gate && !canAccess(payload.plan, pathname)) {
    const url = new URL("/dashboard/upgrade", request.url)
    url.searchParams.set("required", gate.minPlan)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/admin/:path*"],
}
