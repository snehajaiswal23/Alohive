"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home, Star, Users, Gift, Share2, RotateCcw, Sparkles,
  BarChart2, Bot, TrendingUp, Settings, LogOut,
} from "lucide-react"

const ownerNav = [
  {
    section: "MAIN",
    items: [
      { label: "Home",       href: "/dashboard",             icon: Home       },
      { label: "Reviews",    href: "/dashboard/reviews",     icon: Star       },
      { label: "Customers",  href: "/dashboard/customers",   icon: Users      },
      { label: "Loyalty",    href: "/dashboard/loyalty",     icon: Gift       },
      { label: "Referrals",  href: "/dashboard/referrals",   icon: Share2     },
    ],
  },
  {
    section: "MARKETING",
    items: [
      { label: "Win-back",   href: "/dashboard/winback",     icon: RotateCcw  },
      { label: "AI Studio",  href: "/dashboard/ai-studio",   icon: Sparkles   },
    ],
  },
  {
    section: "INSIGHTS",
    items: [
      { label: "Analytics",    href: "/dashboard/analytics",     icon: BarChart2  },
      { label: "AI Assistant", href: "/dashboard/ai-assistant",  icon: Bot        },
      { label: "Competitors",  href: "/dashboard/competitors",   icon: TrendingUp },
    ],
  },
  {
    section: "ACCOUNT",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col border-r border-gray-200 bg-white overflow-y-auto">
      {/* Logo */}
      <div className="px-5 h-14 flex items-center border-b border-gray-100">
        <Link href="/dashboard" className="text-lg font-bold text-gray-900 tracking-tight">
          Al<span className="text-clarity-500">o</span>hive
        </Link>
        <span className="ml-2 text-[10px] font-semibold bg-clarity-50 text-clarity-600 border border-clarity-200 px-1.5 py-0.5 rounded-full">
          Owner
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {ownerNav.map((group) => (
          <div key={group.section}>
            <p className="text-[10px] font-semibold tracking-widest text-gray-400 px-2 mb-2">
              {group.section}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-clarity-50 text-clarity-700 border-l-2 border-clarity-500 pl-[10px]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      )}
                    >
                      <item.icon className={cn("w-4 h-4", active ? "text-clarity-600" : "text-gray-400")} />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-clarity-100 flex items-center justify-center text-clarity-700 text-xs font-bold">
            P
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 text-xs truncate">Priya Mehta</p>
            <p className="text-gray-400 text-[10px] truncate">Gloss Studio · Owner</p>
          </div>
          <LogOut className="w-4 h-4 text-gray-300" />
        </div>
      </div>
    </aside>
  )
}
