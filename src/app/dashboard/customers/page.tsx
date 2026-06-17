import { cookies } from "next/headers"
import { Topbar } from "@/components/dashboard/topbar"
import { CustomerTable } from "@/components/dashboard/customer-table"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const PAGE_SIZE = 10

export default async function CustomersPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const payload = token ? await verifySession(token).catch(() => null) : null

  const user = payload
    ? await prisma.user.findUnique({ where: { id: payload.userId }, include: { business: true } })
    : null

  const [customers, total] = user
    ? await Promise.all([
        prisma.customer.findMany({
          where: { businessId: user.businessId },
          orderBy: { lastVisitAt: { sort: "desc", nulls: "last" } },
          take: PAGE_SIZE,
        }),
        prisma.customer.count({ where: { businessId: user.businessId } }),
      ])
    : [[], 0]

  return (
    <div>
      <Topbar title="Customers" subtitle="View and manage your customer base" />
      <div className="p-6 space-y-5">
        {user && (
          <CustomerTable
            businessId={user.businessId}
            initialCustomers={customers.map((c) => ({
              id: c.id,
              name: c.name,
              phone: c.phone,
              totalVisits: c.totalVisits,
              lastVisitAt: c.lastVisitAt?.toISOString() ?? null,
              feedbackAvg: c.feedbackAvg,
            }))}
            initialTotal={total}
            pageSize={PAGE_SIZE}
          />
        )}
      </div>
    </div>
  )
}
