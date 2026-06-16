import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changePositive?: boolean
  icon?: React.ReactNode
  accentColor?: "teal" | "blue" | "green" | "amber" | "red"
  theme?: "dark" | "light"
}

const accentMap = {
  teal:  "text-clarity-400",
  blue:  "text-trust-400",
  green: "text-growth-400",
  amber: "text-amber-400",
  red:   "text-red-400",
}

const bgAccentMap = {
  teal:  "bg-clarity-900/30 text-clarity-400",
  blue:  "bg-trust-900/30 text-trust-400",
  green: "bg-growth-900/30 text-growth-400",
  amber: "bg-amber-900/30 text-amber-400",
  red:   "bg-red-900/30 text-red-400",
}

const bgAccentLightMap = {
  teal:  "bg-clarity-50 text-clarity-600",
  blue:  "bg-trust-50 text-trust-600",
  green: "bg-growth-50 text-growth-600",
  amber: "bg-amber-50 text-amber-600",
  red:   "bg-red-50 text-red-600",
}

export function StatCard({ title, value, change, changePositive, icon, accentColor = "teal", theme = "dark" }: StatCardProps) {
  const isDark = theme === "dark"

  return (
    <div className={cn(
      "rounded-[12px] p-5",
      isDark ? "glass-card" : "bg-white border border-gray-200 shadow-sm",
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-xs font-medium uppercase tracking-wide mb-1", isDark ? "text-text-secondary" : "text-gray-500")}>
            {title}
          </p>
          <p className={cn("text-2xl font-bold", isDark ? "text-text-primary" : "text-gray-900")}>
            {value}
          </p>
          {change && (
            <p className={cn("text-xs mt-1", changePositive ? "text-growth-400" : "text-red-400")}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn("p-2 rounded-lg", isDark ? bgAccentMap[accentColor] : bgAccentLightMap[accentColor])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
