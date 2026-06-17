import { prisma } from "@/lib/prisma"

interface AuditParams {
  adminEmail: string
  action: string
  detail: string
  ip?: string
  businessId?: string
}

export async function writeAdminAudit({ adminEmail, action, detail, ip, businessId }: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        details: { actor: adminEmail, detail },
        ipAddress: ip ?? null,
        businessId: businessId ?? null,
      },
    })
  } catch {
    // Audit failures should never block the main operation
  }
}

/** Extract the real client IP from Next.js/Vercel headers. */
export function getClientIp(req: { headers: { get(k: string): string | null } }): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}
