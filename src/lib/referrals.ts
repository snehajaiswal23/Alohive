import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { normalizePhone } from "@/lib/phone"

export class ReferralError extends Error {}

export async function getOrCreateReferralCode(customerId: string): Promise<string> {
  const customer = await prisma.customer.findUniqueOrThrow({ where: { id: customerId } })
  if (customer.referralCode) return customer.referralCode

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomBytes(5).toString("hex")
    try {
      await prisma.customer.update({ where: { id: customerId }, data: { referralCode: code } })
      return code
    } catch {
      // unique constraint collision — retry with a new code
    }
  }
  throw new Error("Could not generate a unique referral code")
}

export function buildReferralLink(code: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/r/${code}`
}

export async function findReferrerByCode(code: string) {
  return prisma.customer.findUnique({
    where: { referralCode: code },
    include: { business: true },
  })
}

export async function createPendingReferral(
  businessId: string,
  referrerCustomerId: string,
  referredName: string,
  referredPhone: string,
) {
  const normalizedPhone = normalizePhone(referredPhone || "")
  if (normalizedPhone.length < 10) {
    throw new ReferralError("A valid referred phone number is required")
  }
  if (!referredName?.trim()) {
    throw new ReferralError("Referred customer name is required")
  }

  const referrer = await prisma.customer.findFirst({ where: { id: referrerCustomerId, businessId } })
  if (!referrer) {
    throw new ReferralError("Referrer customer not found")
  }
  if (normalizedPhone === referrer.phone) {
    throw new ReferralError("A customer cannot refer themselves")
  }

  let referred = await prisma.customer.findFirst({ where: { businessId, phone: normalizedPhone } })
  if (!referred) {
    referred = await prisma.customer.create({
      data: { businessId, name: referredName.trim(), phone: normalizedPhone },
    })
  }

  const existing = await prisma.referral.findFirst({
    where: { businessId, referredCustomerId: referred.id, status: "pending" },
  })
  if (existing) {
    throw new ReferralError("This customer already has a pending referral")
  }

  return prisma.referral.create({
    data: { businessId, referrerCustomerId: referrer.id, referredCustomerId: referred.id },
  })
}
