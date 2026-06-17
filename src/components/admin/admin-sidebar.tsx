"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart2, Building2, IndianRupee, Activity, MessageSquare, ToggleLeft, FileText, ShieldCheck, LogOut } from "lucide-react"
import { useState } from "react"

const nav = [
  { label: "Overview",       href: "/admin",                icon: BarChart2 },
  { label: "Businesses",     href: "/admin/businesses",     icon: Building2 },
  { label: "Revenue",        href: "/admin/revenue",        icon: IndianRupee },
  { label: "Platform health",href: "/admin/platform-health",icon: Activity },
  { label: "WA templates",   href: "/admin/wa-templates",   icon: MessageSquare },
  { label: "Feature flags",  href: "/admin/feature-flags",  icon: ToggleLeft },
  { label: "Audit log",      href: "/admin/audit-log",      icon: FileText },
  { label: "2FA setup",      href: "/admin/setup-2fa",      icon: ShieldCheck },
]

interface Props {
  adminName: string
  adminEmail: string
}

export function AdminSidebar({ adminName, adminEmail }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch("/api/admin/auth/logout", { method: "POST" })
    router.push("/admin/login")
  }

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col bg-obsidian border-r border-slate-800 overflow-y-auto">
      <div className="px-5 h-14 flex items-center border-b border-slate-800">
        <span className="text-base font-bold text-text-primary">
          Al<span className="text-purple-400">o</span>hive{" "}
          <span className="text-xs font-normal text-text-tertiary ml-1">ADMIN</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                    active ? "bg-purple-900/40 text-purple-300" : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
                  )}
                >
                  <item.icon className={cn("w-4 h-4", active ? "text-purple-400" : "text-text-tertiary")} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-4 py-3 border-t border-slate-800 space-y-2">
        <div>
          <p className="text-xs font-medium text-text-primary">{adminName}</p>
          <p className="text-[10px] text-text-tertiary truncate">{adminEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 text-xs text-text-tertiary hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  )
}
