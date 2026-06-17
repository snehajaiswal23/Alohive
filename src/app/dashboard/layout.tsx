import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) redirect("/login")

  let payload
  try {
    payload = await verifySession(token)
  } catch {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { business: true },
  })
  if (!user || !user.isActive) redirect("/api/auth/logout")

  // Sync JWT plan with DB plan. JWT may be stale after a webhook-triggered plan change.
  const dbPlan = user.business.plan ?? "trial"
  if (payload.plan !== dbPlan) {
    const pathname = (await headers()).get("x-pathname") ?? "/dashboard"
    redirect(`/api/auth/refresh?then=${encodeURIComponent(pathname)}`)
  }

  return (
    <div className="dashboard-root flex h-screen overflow-hidden">
      <Sidebar
        role={user.role}
        userName={user.name}
        businessName={user.business.name}
        plan={dbPlan}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
