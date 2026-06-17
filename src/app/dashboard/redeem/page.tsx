import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { getLoyaltyConfig, getRewardCatalog } from "@/lib/loyalty"
import { RedeemClient } from "@/components/staff/redeem-client"

export default async function RedeemPage() {
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

  const config = await getLoyaltyConfig(user.businessId)
  const rewards = getRewardCatalog(config)

  return <RedeemClient businessId={user.businessId} rewards={rewards} />
}
