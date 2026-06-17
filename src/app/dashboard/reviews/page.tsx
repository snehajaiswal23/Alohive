import { cookies } from "next/headers"
import { Topbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/ui/stat-card"
import { DashCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GoogleConnectionCard } from "@/components/dashboard/google-connection-card"
import { ReviewsGrowthChart, MonthlyReviewPoint } from "@/components/dashboard/reviews-growth-chart"
import { ReviewCard } from "@/components/dashboard/review-card"
import { Star, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { calculateRatingTrend } from "@/lib/google-reviews"

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function buildGrowthChart(
  reviews: { rating: number; publishedAt: Date | null; createdAt: Date }[],
  months: number,
): MonthlyReviewPoint[] {
  const now = new Date()
  const points: MonthlyReviewPoint[] = []

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const label = `${MONTH_LABELS[monthDate.getMonth()]} ${monthDate.getFullYear().toString().slice(2)}`

    const bucket = reviews.filter((r) => {
      const d = r.publishedAt ?? r.createdAt
      return d >= monthDate && d < monthEnd
    })

    const count = bucket.length
    const avgRating = count > 0 ? bucket.reduce((sum, r) => sum + r.rating, 0) / count : null
    points.push({ month: label, count, avgRating: avgRating != null ? Math.round(avgRating * 10) / 10 : null })
  }

  return points
}

interface MonthStat {
  label: string
  count: number
  avgRating: number | null
  countChange: number | null
  ratingChange: number | null
}

function buildMonthComparison(
  reviews: { rating: number; publishedAt: Date | null; createdAt: Date }[],
): MonthStat[] {
  const now = new Date()
  const stats: MonthStat[] = []

  for (let i = 2; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const label = `${MONTH_LABELS[monthDate.getMonth()]}`

    const bucket = reviews.filter((r) => {
      const d = r.publishedAt ?? r.createdAt
      return d >= monthDate && d < monthEnd
    })

    const count = bucket.length
    const avgRating = count > 0 ? bucket.reduce((s, r) => s + r.rating, 0) / count : null

    // compare vs prior month
    const priorDate = new Date(now.getFullYear(), now.getMonth() - i - 1, 1)
    const priorEnd = monthDate
    const prior = reviews.filter((r) => {
      const d = r.publishedAt ?? r.createdAt
      return d >= priorDate && d < priorEnd
    })
    const priorCount = prior.length
    const priorAvg = priorCount > 0 ? prior.reduce((s, r) => s + r.rating, 0) / priorCount : null

    stats.push({
      label,
      count,
      avgRating: avgRating != null ? Math.round(avgRating * 10) / 10 : null,
      countChange: priorCount > 0 ? count - priorCount : null,
      ratingChange: avgRating != null && priorAvg != null ? Math.round((avgRating - priorAvg) * 10) / 10 : null,
    })
  }

  return stats
}

interface ReviewsPageProps {
  searchParams: Promise<{ google?: string; message?: string }>
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const { google: googleStatus, message: googleMessage } = await searchParams
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const payload = token ? await verifySession(token).catch(() => null) : null
  const user = payload ? await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, businessId: true } }) : null

  type ReviewRow = Awaited<ReturnType<typeof prisma.googleReview.findMany>>[number]
  let reviews: ReviewRow[] = []
  let totalReviews = 0
  let averageRating: number | null = null
  let thisMonthCount = 0
  let monthChangeLabel: string | undefined
  let monthChangePositive: boolean | undefined
  let negativeUnreplied: ReviewRow[] = []
  let trend: Awaited<ReturnType<typeof calculateRatingTrend>> | null = null
  let oauthConfig: { isConnected: boolean; connectedAt: Date | null; lastSyncedAt: Date | null; lastError: string | null } | null = null
  let growthData: MonthlyReviewPoint[] = []
  let monthStats: MonthStat[] = []

  if (user) {
    const businessId = user.businessId
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const thisMonthStart = startOfMonth(now)
    const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1))

    const [allReviews, avgResult, thisMonth, lastMonth, trendResult, config] = await Promise.all([
      prisma.googleReview.findMany({
        where: { businessId },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      }),
      prisma.googleReview.aggregate({ where: { businessId }, _avg: { rating: true } }),
      prisma.googleReview.count({
        where: { businessId, OR: [{ publishedAt: { gte: thisMonthStart } }, { publishedAt: null, createdAt: { gte: thisMonthStart } }] },
      }),
      prisma.googleReview.count({
        where: { businessId, OR: [{ publishedAt: { gte: lastMonthStart, lt: thisMonthStart } }, { publishedAt: null, createdAt: { gte: lastMonthStart, lt: thisMonthStart } }] },
      }),
      calculateRatingTrend(businessId),
      prisma.googleOAuthConfig.findUnique({ where: { businessId } }),
    ])

    reviews = allReviews
    totalReviews = allReviews.length
    averageRating = avgResult._avg.rating
    thisMonthCount = thisMonth
    negativeUnreplied = allReviews.filter((r) => r.rating <= 2 && !r.replyText)
    trend = trendResult
    oauthConfig = config

    if (lastMonth > 0) {
      const pct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
      monthChangeLabel = `${pct >= 0 ? "+" : ""}${pct}% vs last month`
      monthChangePositive = pct >= 0
    }

    const chartSource = allReviews
      .filter((r) => (r.publishedAt ?? r.createdAt) >= sixMonthsAgo)
      .map((r) => ({ rating: r.rating, publishedAt: r.publishedAt, createdAt: r.createdAt }))

    growthData = buildGrowthChart(chartSource, 6)
    monthStats = buildMonthComparison(
      allReviews.map((r) => ({ rating: r.rating, publishedAt: r.publishedAt, createdAt: r.createdAt })),
    )
  }

  const avgChangeLabel = trend?.trend
    ? `${trend.delta! >= 0 ? "+" : ""}${trend.delta!.toFixed(1)} vs prior 30d`
    : undefined

  const TrendIcon = trend?.trend === "up" ? TrendingUp : trend?.trend === "down" ? TrendingDown : Minus

  return (
    <div>
      <Topbar title="Reviews" subtitle="Monitor, respond to, and grow your Google ratings" />
      <div className="p-6 space-y-6">

        {googleStatus === "connected" && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-[12px] px-4 py-3">
            Google Business Profile connected — reviews will sync automatically every 6 hours.
          </div>
        )}
        {googleStatus === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-[12px] px-4 py-3">
            Couldn&apos;t connect Google Business Profile{googleMessage ? `: ${googleMessage}` : "."}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            theme="light"
            title="Total reviews"
            value={totalReviews}
            accentColor="blue"
            icon={<Star size={16} />}
          />
          <StatCard
            theme="light"
            title="Average rating"
            value={averageRating != null ? `${averageRating.toFixed(1)} ★` : "—"}
            change={avgChangeLabel}
            changePositive={trend?.trend === "up" ? true : trend?.trend === "down" ? false : undefined}
            accentColor="amber"
            icon={<TrendIcon size={16} />}
          />
          <StatCard
            theme="light"
            title="This month"
            value={thisMonthCount}
            change={monthChangeLabel}
            changePositive={monthChangePositive}
            accentColor="green"
            icon={<TrendingUp size={16} />}
          />
          <StatCard
            theme="light"
            title="Needs reply"
            value={negativeUnreplied.length}
            change={negativeUnreplied.length > 0 ? "Unhappy, no reply" : undefined}
            accentColor="red"
            icon={<AlertCircle size={16} />}
          />
        </div>

        {/* Growth chart + MoM comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <DashCard className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Review growth</h2>
                <p className="text-xs text-gray-400 mt-0.5">Monthly volume (bars) · avg rating (dashed line)</p>
              </div>
              {trend?.trend && (
                <Badge
                  color={trend.trend === "up" ? "green" : trend.trend === "down" ? "red" : "gray"}
                  variant="subtle"
                >
                  {trend.trend === "up" ? "↑ Improving" : trend.trend === "down" ? "↓ Declining" : "→ Stable"}
                </Badge>
              )}
            </div>
            <ReviewsGrowthChart data={growthData} />
          </DashCard>

          <DashCard>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Month-over-month</h2>
            {monthStats.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No data yet</p>
            ) : (
              <div className="space-y-4">
                {monthStats.map((m) => (
                  <div key={m.label} className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-700">{m.label}</p>
                      <p className="text-xl font-bold text-gray-900 mt-0.5">{m.count}</p>
                      <p className="text-xs text-gray-400">
                        {m.avgRating != null ? `${m.avgRating.toFixed(1)} ★ avg` : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      {m.countChange != null && (
                        <span className={`text-xs font-medium ${m.countChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {m.countChange >= 0 ? "+" : ""}{m.countChange} reviews
                        </span>
                      )}
                      {m.ratingChange != null && (
                        <p className={`text-xs mt-0.5 ${m.ratingChange >= 0.05 ? "text-green-600" : m.ratingChange <= -0.05 ? "text-red-500" : "text-gray-400"}`}>
                          {m.ratingChange >= 0 ? "+" : ""}{m.ratingChange.toFixed(1)} ★
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashCard>
        </div>

        {/* Google connection */}
        {user && <GoogleConnectionCard businessId={user.businessId} config={oauthConfig} />}

        {/* Negative alerts */}
        {negativeUnreplied.length > 0 && (
          <DashCard className="border-red-200 bg-red-50/20">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <h2 className="text-sm font-semibold text-red-700">
                {negativeUnreplied.length} unhappy review{negativeUnreplied.length !== 1 ? "s" : ""} without a reply
              </h2>
            </div>
            <div className="space-y-3">
              {negativeUnreplied.map((r) => (
                <div key={r.id} className="flex items-start gap-3 bg-white border border-red-100 rounded-lg px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600 shrink-0">
                    {r.reviewerName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{r.reviewerName}</p>
                    <div className="flex gap-0.5 my-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={`text-xs ${s <= r.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                      ))}
                    </div>
                    {r.reviewText && <p className="text-xs text-gray-500 truncate">&ldquo;{r.reviewText}&rdquo;</p>}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-red-500 mt-3">
              Replying within 24h can recover trust and improve your public rating. Use the &ldquo;Suggest reply&rdquo; button on each review below.
            </p>
          </DashCard>
        )}

        {/* Full review list */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            All reviews {totalReviews > 0 && <span className="text-gray-400 font-normal">({totalReviews})</span>}
          </h2>
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <DashCard>
                <p className="text-sm text-gray-400 text-center py-8">
                  No reviews yet — connect Google Business Profile to start syncing.
                </p>
              </DashCard>
            ) : (
              reviews.map((r) => (
                <ReviewCard
                  key={r.id}
                  id={r.id}
                  businessId={user!.businessId}
                  reviewerName={r.reviewerName}
                  rating={r.rating}
                  reviewText={r.reviewText}
                  replyText={r.replyText}
                  aiSuggestedReply={r.aiSuggestedReply}
                  googleReviewId={r.googleReviewId}
                  googleConnected={oauthConfig?.isConnected ?? false}
                  publishedAt={r.publishedAt}
                  createdAt={r.createdAt}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
