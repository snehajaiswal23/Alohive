import Link from "next/link"
import { cookies } from "next/headers"
import { ArrowLeft } from "lucide-react"
import { Topbar } from "@/components/dashboard/topbar"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CustomerLoyaltyActions } from "@/components/dashboard/customer-loyalty-actions"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { prisma } from "@/lib/prisma"

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>
}) {
  const { customerId } = await params
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const payload = token ? await verifySession(token).catch(() => null) : null
  const user = payload
    ? await prisma.user.findUnique({ where: { id: payload.userId } })
    : null

  const customer = user
    ? await prisma.customer.findFirst({
        where: { id: customerId, businessId: user.businessId },
        include: {
          visits: {
            orderBy: { visitedAt: "desc" },
            include: { staff: true, feedback: true },
          },
        },
      })
    : null

  return (
    <div>
      <Topbar title={customer?.name ?? "Customer"} subtitle="Full visit history" />
      <div className="p-6 space-y-5 max-w-4xl">
        <Link href="/dashboard/customers" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft size={14} /> Back to customers
        </Link>

        {!customer ? (
          <DashCard>
            <p className="text-sm text-gray-500">Customer not found.</p>
          </DashCard>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DashCard>
                <p className="text-xs text-gray-400 mb-1">Phone</p>
                <p className="text-sm font-semibold text-gray-800">{customer.phone}</p>
              </DashCard>
              <DashCard>
                <p className="text-xs text-gray-400 mb-1">Total visits</p>
                <p className="text-sm font-semibold text-gray-800">{customer.totalVisits}</p>
              </DashCard>
              <DashCard>
                <p className="text-xs text-gray-400 mb-1">Loyalty points</p>
                <p className="text-sm font-semibold text-gray-800">{customer.loyaltyPoints.toLocaleString()}</p>
              </DashCard>
              <DashCard>
                <p className="text-xs text-gray-400 mb-1">Feedback score</p>
                <p className="text-sm font-semibold text-gray-800">
                  {customer.feedbackAvg > 0 ? `${customer.feedbackAvg.toFixed(1)} ★` : "No feedback yet"}
                </p>
              </DashCard>
            </div>

            <DashCard className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-gray-400 mb-1">Loyalty tier</p>
                <Badge color={customer.loyaltyTier === "Platinum" || customer.loyaltyTier === "Gold" ? "blue" : customer.loyaltyTier === "Silver" ? "gray" : "amber"} variant="subtle">
                  {customer.loyaltyTier}
                </Badge>
              </div>
              {user && <CustomerLoyaltyActions businessId={user.businessId} customerId={customer.id} />}
            </DashCard>

            <DashCard className="p-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">Visit history</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Date", "Service", "Staff", "Bill", "Feedback"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customer.visits.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-gray-400">No visits yet</td>
                    </tr>
                  ) : (
                    customer.visits.map((v) => (
                      <tr key={v.id} className="border-b border-gray-50">
                        <td className="px-5 py-3.5 text-gray-500">{formatDate(v.visitedAt)}</td>
                        <td className="px-5 py-3.5 font-medium text-gray-800">{v.service ?? "—"}</td>
                        <td className="px-5 py-3.5 text-gray-500">{v.staff?.name ?? "—"}</td>
                        <td className="px-5 py-3.5 text-gray-500">{v.billAmount ? `₹${v.billAmount.toLocaleString()}` : "—"}</td>
                        <td className="px-5 py-3.5">
                          {v.feedback ? (
                            <div className="flex items-center gap-2">
                              <Badge color={v.feedback.sentiment === "happy" ? "green" : "red"} variant="subtle">
                                {v.feedback.score}/5
                              </Badge>
                              {v.feedback.message && (
                                <span className="text-xs text-gray-400 truncate max-w-[200px]">{v.feedback.message}</span>
                              )}
                            </div>
                          ) : v.feedbackReceived === false && v.whatsappSent ? (
                            <span className="text-xs text-gray-400">Awaiting reply</span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </DashCard>
          </>
        )}
      </div>
    </div>
  )
}
