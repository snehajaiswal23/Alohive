import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-session"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies()
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value

  if (!token) redirect("/admin/login")

  let session
  try {
    session = await verifyAdminSession(token)
  } catch {
    redirect("/admin/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-obsidian">
      <AdminSidebar adminName={session.name} adminEmail={session.email} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
