import Link from "next/link"
import { cookies } from "next/headers"
import { Topbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/ui/stat-card"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { getLoyaltyConfig } from "@/lib/loyalty"
import { Share2, TrendingUp, CheckCircle } from "lucide-react"

export default async function ReferralsPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const payload = token ? await verifySession(token).catch(() => null) : null
  const user = payload ? await prisma.user.findUnique({ where: { id: payload.userId } }) : null

  let totalReferrals = 0
  let converted = 0
  let topReferrers: { id: string; name: string; sent: number; converted: number; pointsEarned: number }[] = []
  let pointsPerReferral = 0

  if (user) {
    const [referrals, config] = await Promise.all([
      prisma.referral.findMany({
        where: { businessId: user.businessId },
        include: { referrer: true },
      }),
      getLoyaltyConfig(user.businessId),
    ])

    pointsPerReferral = config.pointsPerReferral
    totalReferrals = referrals.length
    converted = referrals.filter((r) => r.status === "completed").length

    const byReferrer = new Map<string, { id: string; name: string; sent: number; converted: number }>()
    for (const r of referrals) {
      const entry = byReferrer.get(r.referrerCustomerId) ?? {
        id: r.referrerCustomerId,
        name: r.referrer.name,
        sent: 0,
        converted: 0,
      }
      entry.sent++
      if (r.status === "completed") entry.converted++
      byReferrer.set(r.referrerCustomerId, entry)
    }

    topReferrers = [...byReferrer.values()]
      .map((r) => ({ ...r, pointsEarned: r.converted * pointsPerReferral }))
      .sort((a, b) => b.sent - a.sent)
      .slice(0, 8)
  }

  const conversionRate = totalReferrals > 0 ? Math.round((converted / totalReferrals) * 100) : 0

  return (
    <div>
      <Topbar title="Referrals" subtitle="Track and manage your referral program" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard theme="light" title="Total referrals sent" value={totalReferrals} accentColor="teal" icon={<Share2 size={16} />} />
          <StatCard theme="light" title="Converted" value={converted} accentColor="green" icon={<CheckCircle size={16} />} />
          <StatCard theme="light" title="Conversion rate" value={`${conversionRate}%`} accentColor="blue" icon={<TrendingUp size={16} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashCard>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Top referrers</h2>
            {topReferrers.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No referrals yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Customer", "Sent", "Converted", "Points earned"].map((h) => (
                      <th key={h} className="text-left pb-2 text-xs font-semibold text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topReferrers.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50">
                      <td className="py-3 font-medium text-gray-800">
                        <Link href={`/dashboard/customers/${r.id}`} className="hover:text-clarity-600">{r.name}</Link>
                      </td>
                      <td className="py-3 text-gray-600">{r.sent}</td>
                      <td className="py-3">
                        <Badge color="green" variant="subtle">{r.converted}</Badge>
                      </td>
                      <td className="py-3 font-medium text-growth-600">{r.pointsEarned.toLocaleString()} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </DashCard>

          <DashCard>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Referral reward settings</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-600">Referrer reward</span>
                <span className="font-medium text-gray-800">{pointsPerReferral} pts per converted referral</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-600">Referred friend reward</span>
                <span className="font-medium text-gray-800">{pointsPerReferral} pts welcome bonus</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-600">Converts on</span>
                <span className="font-medium text-gray-800">Referred friend's first visit</span>
              </div>
              <Link href="/dashboard/loyalty" className="block w-full mt-1 text-sm text-clarity-600 font-medium hover:text-clarity-700 py-2">
                Edit in loyalty settings →
              </Link>
            </div>
          </DashCard>
        </div>
      </div>
    </div>
  )
}
