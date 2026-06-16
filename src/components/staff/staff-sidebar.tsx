"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, ClipboardList, Search, Gift, Bell, LogOut } from "lucide-react"

const nav = [
  { label: "Today", href: "/staff", icon: Home },
  { label: "Log visit", href: "/staff/log-visit", icon: ClipboardList },
  { label: "Find customer", href: "/staff/find-customer", icon: Search },
  { label: "Loyalty", href: "/staff/loyalty", icon: Gift },
  { label: "Alerts", href: "/staff/alerts", icon: Bell },
]

export function StaffSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col border-r border-gray-100 bg-white overflow-y-auto">
      {/* Logo + role pill */}
      <div className="px-5 h-14 flex items-center gap-2 border-b border-gray-100">
        <Link href="/staff" className="text-lg font-bold text-gray-900 tracking-tight">
          Al<span className="text-trust-500">o</span>hive
        </Link>
        <span className="text-[10px] font-semibold bg-trust-50 text-trust-600 border border-trust-200 px-1.5 py-0.5 rounded-full">
          Staff
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <p className="text-[10px] font-semibold tracking-widest text-gray-400 px-2 mb-2">TASKS</p>
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const active =
              item.href === "/staff" ? pathname === "/staff" : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-trust-50 text-trust-700 border-l-2 border-trust-500 pl-[10px]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon
                    className={cn("w-4 h-4", active ? "text-trust-500" : "text-gray-400")}
                  />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-trust-100 flex items-center justify-center text-xs font-bold text-trust-700">
            K
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-700 text-xs truncate">Kavya Rao</p>
            <p className="text-gray-400 text-[10px] truncate">Receptionist</p>
          </div>
          <LogOut className="w-3.5 h-3.5 text-gray-300" />
        </div>
      </div>
    </aside>
  )
}
