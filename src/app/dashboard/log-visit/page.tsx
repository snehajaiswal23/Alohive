import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { LogVisitClient } from "@/components/staff/log-visit-client"

export default async function LogVisitPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) redirect("/login")

  let payload
  try {
    payload = await verifySession(token)
  } catch {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) redirect("/login")

  const [services, stylists] = await Promise.all([
    prisma.service.findMany({
      where: { businessId: user.businessId, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.staff.findMany({
      where: { businessId: user.businessId },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <LogVisitClient
      businessId={user.businessId}
      services={services.map((s) => ({ id: s.id, name: s.name }))}
      stylists={stylists.map((s) => ({ id: s.id, name: s.name }))}
    />
  )
}
