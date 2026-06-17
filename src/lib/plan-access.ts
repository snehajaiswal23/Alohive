// Plan tier ranks. Higher = more access. Trial gets everything (showcase period).
export const PLAN_RANK: Record<string, number> = {
  trial:   99,
  pro:     3,
  growth:  2,
  starter: 1,
}

export interface GatedRoute {
  prefix: string
  minPlan: string
  minRank: number
  label: string
}

// Routes that require a specific plan tier
export const GATED_ROUTES: GatedRoute[] = [
  { prefix: "/dashboard/ai-studio",    minPlan: "pro",    minRank: 3, label: "AI Studio" },
  { prefix: "/dashboard/ai-assistant", minPlan: "pro",    minRank: 3, label: "AI Assistant" },
  { prefix: "/dashboard/competitors",  minPlan: "pro",    minRank: 3, label: "Competitor Tracking" },
  { prefix: "/dashboard/winback",      minPlan: "growth", minRank: 2, label: "Win-back Campaigns" },
  { prefix: "/dashboard/referrals",    minPlan: "growth", minRank: 2, label: "Referral Program" },
  { prefix: "/dashboard/analytics",    minPlan: "growth", minRank: 2, label: "Analytics" },
]

export function requiredPlanFor(pathname: string): GatedRoute | null {
  return (
    GATED_ROUTES.find(
      (r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"),
    ) ?? null
  )
}

export function canAccess(plan: string | undefined, pathname: string): boolean {
  const req = requiredPlanFor(pathname)
  if (!req) return true
  return (PLAN_RANK[plan ?? ""] ?? 0) >= req.minRank
}
