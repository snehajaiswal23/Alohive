"use client"
import { Bell } from "lucide-react"

interface StaffTopbarProps {
  title: string
  subtitle?: string
  alertCount?: number
}

export function StaffTopbar({ title, subtitle, alertCount = 0 }: StaffTopbarProps) {
  return (
    <header className="h-14 border-b border-gray-100 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <a href="/staff/alerts" className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <Bell size={16} />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </a>
      </div>
    </header>
  )
}
