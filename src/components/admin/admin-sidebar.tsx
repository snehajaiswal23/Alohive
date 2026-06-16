"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart2, Building2, IndianRupee, Activity, MessageSquare, ToggleLeft, FileText, Settings } from "lucide-react"

const nav = [
  { label: "Overview", href: "/admin", icon: BarChart2 },
  { label: "Businesses", href: "/admin/businesses", icon: Building2 },
  { label: "Revenue", href: "/admin/revenue", icon: IndianRupee },
  { label: "Platform health", href: "/admin/platform-health", icon: Activity },
  { label: "WA templates", href: "/admin/wa-templates", icon: MessageSquare },
  { label: "Feature flags", href: "/admin/feature-flags", icon: ToggleLeft },
  { label: "Audit log", href: "/admin/audit-log", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

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

      <div className="px-4 py-3 border-t border-slate-800">
        <p className="text-[10px] text-text-tertiary">Logged in as <span className="text-text-secondary">admin@alohive.in</span></p>
      </div>
    </aside>
  )
}
