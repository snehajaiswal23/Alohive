import { cookies } from "next/headers"
import { Topbar } from "@/components/dashboard/topbar"
import { DashCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StaffManagement } from "@/components/dashboard/staff-management"
import { CatalogManagement } from "@/components/dashboard/catalog-management"
import { WhatsappManagement } from "@/components/dashboard/whatsapp-management"
import { verifySession, SESSION_COOKIE } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Building2, MessageSquare, Users, CreditCard, Bell, Download } from "lucide-react"

export default async function SettingsPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const payload = token ? await verifySession(token).catch(() => null) : null

  const user = payload
    ? await prisma.user.findUnique({ where: { id: payload.userId }, include: { business: true } })
    : null

  const staffRows = user
    ? await prisma.user.findMany({
        where: { businessId: user.businessId, role: "receptionist" },
        select: { id: true, name: true, email: true, isActive: true, lastLogin: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      })
    : []

  const activeCount = staffRows.filter((s) => s.isActive).length

  const [serviceRows, stylistRows, whatsappConfig, whatsappTemplates, subscription] = user
    ? await Promise.all([
        prisma.service.findMany({ where: { businessId: user.businessId }, orderBy: { name: "asc" } }),
        prisma.staff.findMany({ where: { businessId: user.businessId }, orderBy: { name: "asc" } }),
        prisma.whatsappConfig.findUnique({ where: { businessId: user.businessId } }),
        prisma.whatsappTemplate.findMany({ where: { businessId: user.businessId }, orderBy: { createdAt: "asc" } }),
        prisma.subscription.findUnique({ where: { businessId: user.businessId } }),
      ])
    : [[], [], null, [], null]

  const sections = [
    {
      icon: Building2,
      title: "Business profile",
      desc: "Name, address, category, logo, opening hours",
      status: "Configured",
      color: "green",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp setup",
      desc: whatsappConfig?.isConnected
        ? `${user?.business.whatsappNumber || "No number set"} · Connected via Gupshup`
        : "Not connected yet",
      status: whatsappConfig?.isConnected ? "Connected" : "Not connected",
      color: whatsappConfig?.isConnected ? "green" : "gray",
    },
    {
      icon: Building2,
      title: "Google review link",
      desc: "maps.google.com/?cid=… · Verified",
      status: "Verified",
      color: "green",
    },
    {
      icon: Users,
      title: "Staff management",
      desc: `${activeCount} receptionist${activeCount === 1 ? "" : "s"} · 1 owner`,
      status: null,
      color: null,
    },
    {
      icon: CreditCard,
      title: "Plan & billing",
      desc: subscription
        ? `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} plan · ${subscription.status === "active" ? "Active" : subscription.status}${subscription.currentPeriodEnd ? ` · Renews ${subscription.currentPeriodEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}`
        : "No active subscription",
      status: subscription?.status === "active" ? "Active" : subscription?.status === "trialing" ? "Trial" : subscription ? "Inactive" : null,
      color: subscription?.status === "active" ? "blue" : subscription?.status === "trialing" ? "amber" : "gray",
      href: "/dashboard/billing",
    },
    {
      icon: Bell,
      title: "Notifications",
      desc: "WhatsApp summary, alerts, billing",
      status: null,
      color: null,
    },
  ]

  return (
    <div>
      <Topbar title="Settings" subtitle="Manage your business account and preferences" />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Settings overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((s, i) => (
            <DashCard key={i} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-gray-800 text-sm">{s.title}</p>
                  {s.status && <Badge color={s.color as "green" | "blue" | "gray"} variant="subtle">{s.status}</Badge>}
                </div>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
              {"href" in s && s.href ? (
                <a href={s.href} className="text-xs text-clarity-600 hover:text-clarity-700 font-medium shrink-0">Manage</a>
              ) : (
                <button className="text-xs text-clarity-600 hover:text-clarity-700 font-medium shrink-0">Edit</button>
              )}
            </DashCard>
          ))}
        </div>

        {/* Staff management */}
        {user && (
          <StaffManagement
            businessId={user.businessId}
            initialStaff={staffRows.map((s) => ({ ...s, lastLogin: s.lastLogin?.toISOString() ?? null, createdAt: s.createdAt.toISOString() }))}
          />
        )}

        {/* Services & stylists */}
        {user && (
          <CatalogManagement
            businessId={user.businessId}
            initialServices={serviceRows}
            initialStylists={stylistRows}
          />
        )}

        {/* WhatsApp setup & templates */}
        {user && (
          <WhatsappManagement
            businessId={user.businessId}
            initialConfig={
              whatsappConfig
                ? {
                    appName: whatsappConfig.appName,
                    isConnected: whatsappConfig.isConnected,
                    lastError: whatsappConfig.lastError,
                    apiKeyMasked: `••••${whatsappConfig.apiKey.slice(-4)}`,
                  }
                : null
            }
            initialTemplates={whatsappTemplates}
          />
        )}

        {/* Data export */}
        <DashCard>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Data export</h2>
          <div className="flex flex-wrap gap-3">
            {["Customer list (CSV)", "Visit history (CSV)", "Loyalty transactions (CSV)", "Campaign performance (CSV)"].map((e) => (
              <Button key={e} variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg">
                <Download size={12} /> {e}
              </Button>
            ))}
          </div>
        </DashCard>
      </div>
    </div>
  )
}
