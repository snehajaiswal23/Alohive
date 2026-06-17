import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember } from "@/lib/api-auth"

type Ctx = { params: Promise<{ id: string }> }

const HOURS = [9,10,11,12,13,14,15,16,17,18,19,20]
// Postgres DOW: 0=Sun … 6=Sat. Reorder to Mon–Sun display.
const DOW_TO_MON_SUN = [1,2,3,4,5,6,0]
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const days = Math.min(365, Math.max(7, parseInt(new URL(req.url).searchParams.get("days") ?? "90")))

  const rows = await prisma.$queryRaw<{ dow: string; hour: string; cnt: string }[]>`
    SELECT
      EXTRACT(DOW FROM "visitedAt")::text AS dow,
      EXTRACT(HOUR FROM "visitedAt")::text AS hour,
      COUNT(*)::text AS cnt
    FROM "Visit"
    WHERE "businessId" = ${id}
      AND "visitedAt" >= NOW() - (${days} || ' days')::interval
    GROUP BY EXTRACT(DOW FROM "visitedAt"), EXTRACT(HOUR FROM "visitedAt")
  `

  const countMap = new Map<string, number>()
  for (const r of rows) {
    countMap.set(`${r.dow}-${r.hour}`, parseInt(r.cnt))
  }
  const maxCount = Math.max(1, ...Array.from(countMap.values()))

  const data: number[][] = DOW_TO_MON_SUN.map((dow) =>
    HOURS.map((h) => {
      const cnt = countMap.get(`${dow}-${h}`) ?? 0
      return Math.round((cnt / maxCount) * 5)
    })
  )

  return Response.json({ businessId: id, days, days_labels: DAYS, hours: HOURS, data })
}
