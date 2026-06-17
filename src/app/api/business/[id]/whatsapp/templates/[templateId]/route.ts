import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/api-auth"

const VALID_STATUSES = ["draft", "submitted", "approved", "rejected"]

async function findTargetTemplate(businessId: string, templateId: string) {
  return prisma.whatsappTemplate.findFirst({ where: { id: templateId, businessId } })
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/business/[id]/whatsapp/templates/[templateId]">) {
  const { id, templateId } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const target = await findTargetTemplate(id, templateId)
  if (!target) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  }

  const { status, gupshupTemplateId } = await req.json()
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 })
  }

  const template = await prisma.whatsappTemplate.update({
    where: { id: templateId },
    data: {
      ...(status !== undefined && { status }),
      ...(gupshupTemplateId !== undefined && { gupshupTemplateId }),
    },
  })

  return NextResponse.json({ template })
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/business/[id]/whatsapp/templates/[templateId]">) {
  const { id, templateId } = await ctx.params
  const { error } = await requireOwner(req, id)
  if (error) return error

  const target = await findTargetTemplate(id, templateId)
  if (!target) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  }

  await prisma.whatsappTemplate.delete({ where: { id: templateId } })
  return NextResponse.json({ success: true })
}
