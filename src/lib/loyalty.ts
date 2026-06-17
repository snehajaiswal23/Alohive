import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export type LoyaltyAwardType = "visit" | "review" | "referral"

interface TierThresholds {
  Silver: number
  Gold: number
  Platinum: number
}

const DEFAULT_THRESHOLDS: TierThresholds = { Silver: 300, Gold: 800, Platinum: 2000 }

export interface LoyaltyReward {
  id: string
  label: string
  points: number
}

const DEFAULT_REWARDS: LoyaltyReward[] = [
  { id: "free-blowdry", label: "Free blowdry", points: 500 },
  { id: "200-off", label: "₹200 off next visit", points: 300 },
  { id: "free-threading", label: "Free eyebrow threading", points: 150 },
]

export function getRewardCatalog(config: { rewards: unknown }): LoyaltyReward[] {
  const rewards = config.rewards as LoyaltyReward[] | null
  return rewards && rewards.length > 0 ? rewards : DEFAULT_REWARDS
}

export class RedemptionError extends Error {}

export async function getLoyaltyConfig(businessId: string) {
  return prisma.loyaltyConfig.upsert({
    where: { businessId },
    update: {},
    create: { businessId },
  })
}

export function computeTier(points: number, thresholds: TierThresholds): string {
  if (points >= thresholds.Platinum) return "Platinum"
  if (points >= thresholds.Gold) return "Gold"
  if (points >= thresholds.Silver) return "Silver"
  return "Bronze"
}

export async function awardLoyaltyPoints(
  tx: Prisma.TransactionClient,
  businessId: string,
  customerId: string,
  type: LoyaltyAwardType,
  description?: string,
) {
  const config = await tx.loyaltyConfig.upsert({
    where: { businessId },
    update: {},
    create: { businessId },
  })

  const points =
    type === "visit" ? config.pointsPerVisit : type === "review" ? config.pointsPerReview : config.pointsPerReferral

  const thresholds = (config.tierThresholds as unknown as TierThresholds) ?? DEFAULT_THRESHOLDS

  // Use atomic increment to avoid lost-update race condition under concurrent visits.
  // Re-fetch the updated row to compute the correct new tier.
  const transaction = await tx.loyaltyTransaction.create({
    data: { businessId, customerId, type, points, description },
  })
  const updated = await tx.customer.update({
    where: { id: customerId },
    data: { loyaltyPoints: { increment: points } },
    select: { loyaltyPoints: true },
  })
  const newTotal = updated.loyaltyPoints
  const newTier = computeTier(newTotal, thresholds)
  await tx.customer.update({ where: { id: customerId }, data: { loyaltyTier: newTier } })

  return { points, transaction, newTotal, newTier }
}

export async function redeemLoyaltyPoints(businessId: string, customerId: string, rewardId: string) {
  return prisma.$transaction(async (tx) => {
    const config = await tx.loyaltyConfig.upsert({
      where: { businessId },
      update: {},
      create: { businessId },
    })

    const reward = getRewardCatalog(config).find((r) => r.id === rewardId)
    if (!reward) throw new RedemptionError("Reward not found")

    const customer = await tx.customer.findFirst({ where: { id: customerId, businessId } })
    if (!customer) throw new RedemptionError("Customer not found")
    if (customer.loyaltyPoints < reward.points) throw new RedemptionError("Insufficient points for this reward")

    const newTotal = customer.loyaltyPoints - reward.points
    const thresholds = (config.tierThresholds as unknown as TierThresholds) ?? DEFAULT_THRESHOLDS
    const newTier = computeTier(newTotal, thresholds)

    await tx.loyaltyTransaction.create({
      data: { businessId, customerId, type: "redemption", points: -reward.points, description: `Redeemed: ${reward.label}` },
    })
    await tx.customer.update({
      where: { id: customerId },
      data: { loyaltyPoints: newTotal, loyaltyTier: newTier },
    })

    return { reward, newTotal, newTier }
  })
}

export async function recalculateAllTiers() {
  const businesses = await prisma.business.findMany({ select: { id: true } })

  let businessesProcessed = 0
  let customersUpdated = 0

  for (const business of businesses) {
    const config = await getLoyaltyConfig(business.id)
    const thresholds = (config.tierThresholds as unknown as TierThresholds) ?? DEFAULT_THRESHOLDS
    businessesProcessed++

    const bands: { tier: string; where: Prisma.CustomerWhereInput }[] = [
      { tier: "Platinum", where: { loyaltyPoints: { gte: thresholds.Platinum } } },
      { tier: "Gold", where: { loyaltyPoints: { gte: thresholds.Gold, lt: thresholds.Platinum } } },
      { tier: "Silver", where: { loyaltyPoints: { gte: thresholds.Silver, lt: thresholds.Gold } } },
      { tier: "Bronze", where: { loyaltyPoints: { lt: thresholds.Silver } } },
    ]

    for (const band of bands) {
      const result = await prisma.customer.updateMany({
        where: { businessId: business.id, loyaltyTier: { not: band.tier }, ...band.where },
        data: { loyaltyTier: band.tier },
      })
      customersUpdated += result.count
    }
  }

  return { businessesProcessed, customersUpdated }
}
