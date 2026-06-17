import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember } from "@/lib/api-auth"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/winback/targets">) {
  const { id } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const bucketParam = req.nextUrl.searchParams.get("bucket")
  const bucket = bucketParam ? Number(bucketParam) : undefined

  const targets = await prisma.winBackTarget.findMany({
    where: { businessId: id, ...(bucket ? { bucket } : {}) },
    orderBy: { daysInactive: "desc" },
    include: { customer: true },
  })

  return NextResponse.json({ targets })
}
