import { NextRequest, NextResponse } from "next/server"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-session"

const DASHBOARD_ROUTE_PREFIX = "/dashboard"
const STAFF_HOME = "/dashboard/today"
const STAFF_ALLOWED_PREFIXES = [
  "/dashboard/today",
  "/dashboard/log-visit",
  "/dashboard/find-customer",
  "/dashboard/redeem",
  "/dashboard/alerts",
]
const ADMIN_ROUTE_PREFIX = "/admin"
const PROTECTED_API_PREFIX = "/api/business"
const AUTH_PAGES = ["/login", "/signup"]

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  try {
    return await verifySession(token)
  } catch {
    return null
  }
}

async function getAdminSession(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null
  try {
    return await verifyAdminSession(token)
  } catch {
    return null
  }
}

function dashboardFor(role: string) {
  return role === "owner" ? "/dashboard" : STAFF_HOME
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith(ADMIN_ROUTE_PREFIX)) {
    const adminSession = await getAdminSession(req)

    if (pathname === "/admin/login") {
      if (adminSession) {
        return NextResponse.redirect(new URL("/admin", req.url))
      }
      return NextResponse.next()
    }

    if (!adminSession) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
    return NextResponse.next()
  }

  const session = await getSession(req)

  if (pathname.startsWith(PROTECTED_API_PREFIX)) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (pathname.startsWith(DASHBOARD_ROUTE_PREFIX)) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    const isStaffAllowed = STAFF_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    if (session.role !== "owner" && !isStaffAllowed) {
      return NextResponse.redirect(new URL(STAFF_HOME, req.url))
    }
    return NextResponse.next()
  }

  if (session && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL(dashboardFor(session.role), req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/business/:path*", "/login", "/signup"],
}
