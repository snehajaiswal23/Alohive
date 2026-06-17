import { prisma } from "@/lib/prisma"
import { runWinbackCampaignsForBusiness } from "@/lib/campaigns"

const DAY_MS = 24 * 60 * 60 * 1000
const BUCKETS = [90, 60, 30]

export async function scanWinBackCustomers() {
  const businesses = await prisma.business.findMany({ select: { id: true } })
  const now = new Date()

  let customersScanned = 0
  let targeted = 0
  let cleared = 0
  let recovered = 0
  let campaignsSent = 0
  let campaignsFailed = 0

  for (const business of businesses) {
    const customers = await prisma.customer.findMany({
      where: { businessId: business.id, lastVisitAt: { not: null } },
      select: { id: true, lastVisitAt: true },
    })
    customersScanned += customers.length

    const qualifyingIds: string[] = []

    for (const customer of customers) {
      const daysInactive = Math.floor((now.getTime() - customer.lastVisitAt!.getTime()) / DAY_MS)
      const bucket = BUCKETS.find((b) => daysInactive >= b)
      if (!bucket) continue

      qualifyingIds.push(customer.id)
      await prisma.winBackTarget.upsert({
        where: { customerId: customer.id },
        update: { bucket, daysInactive, lastVisitAt: customer.lastVisitAt!, scannedAt: now },
        create: {
          businessId: business.id,
          customerId: customer.id,
          bucket,
          daysInactive,
          lastVisitAt: customer.lastVisitAt!,
          scannedAt: now,
        },
      })
      targeted++
    }

    const recoveredCustomers = await prisma.winBackTarget.findMany({
      where: { businessId: business.id, customerId: { notIn: qualifyingIds }, contactedAt: { not: null } },
      include: { customer: true },
    })

    if (recoveredCustomers.length > 0) {
      const winbackCampaigns = await prisma.campaign.findMany({ where: { businessId: business.id, type: "winback" } })
      const campaignByTrigger = new Map(
        winbackCampaigns.filter((c) => c.triggerDays != null).map((c) => [c.triggerDays as number, c]),
      )

      for (const target of recoveredCustomers) {
        await prisma.notification.create({
          data: {
            businessId: business.id,
            type: "winback_recovered",
            title: `Win-back success: ${target.customer.name}`,
            message: `${target.customer.name} returned after being contacted by your ${target.bucket}-day win-back campaign.`,
          },
        })

        const matchingCampaign = campaignByTrigger.get(target.bucket)
        if (matchingCampaign) {
          await prisma.campaign.update({
            where: { id: matchingCampaign.id },
            data: { recoveredCount: { increment: 1 } },
          })
        }
      }
    }
    recovered += recoveredCustomers.length

    const removed = await prisma.winBackTarget.deleteMany({
      where: { businessId: business.id, customerId: { notIn: qualifyingIds } },
    })
    cleared += removed.count

    const campaignResult = await runWinbackCampaignsForBusiness(business.id)
    campaignsSent += campaignResult.sent
    campaignsFailed += campaignResult.failed
  }

  return {
    businessesProcessed: businesses.length,
    customersScanned,
    targeted,
    cleared,
    recovered,
    campaignsSent,
    campaignsFailed,
  }
}
