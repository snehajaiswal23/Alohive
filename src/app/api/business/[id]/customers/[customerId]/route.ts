import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusinessMember } from "@/lib/api-auth"

export async function GET(req: NextRequest, ctx: RouteContext<"/api/business/[id]/customers/[customerId]">) {
  const { id, customerId } = await ctx.params
  const { error } = await requireBusinessMember(req, id)
  if (error) return error

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, businessId: id },
    include: {
      visits: {
        orderBy: { visitedAt: "desc" },
        include: { staff: true, feedback: true },
      },
    },
  })

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 })
  }

  return NextResponse.json({ customer })
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/business/[id]/customers/[customerId]">) {
  const { id, customerId } = await ctx.params
  const body = await req.json()
  return Response.json({ businessId: id, customerId, ...body })
}
