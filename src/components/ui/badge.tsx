import { cn } from "@/lib/utils"

type BadgeColor = "teal" | "blue" | "green" | "amber" | "red" | "gray" | "purple"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor
  variant?: "solid" | "outline" | "subtle"
}

const colorMap: Record<BadgeColor, Record<string, string>> = {
  teal:   { solid: "bg-clarity-500 text-white", outline: "border border-clarity-500 text-clarity-400", subtle: "bg-clarity-900/40 text-clarity-400" },
  blue:   { solid: "bg-trust-500 text-white",   outline: "border border-trust-500 text-trust-400",   subtle: "bg-trust-900/40 text-trust-400" },
  green:  { solid: "bg-growth-500 text-white",  outline: "border border-growth-500 text-growth-400", subtle: "bg-growth-900/40 text-growth-400" },
  amber:  { solid: "bg-amber-500 text-white",   outline: "border border-amber-500 text-amber-400",   subtle: "bg-amber-900/40 text-amber-400" },
  red:    { solid: "bg-red-500 text-white",     outline: "border border-red-500 text-red-400",       subtle: "bg-red-900/30 text-red-400" },
  gray:   { solid: "bg-slate-600 text-white",   outline: "border border-slate-600 text-text-secondary", subtle: "bg-slate-800/60 text-text-secondary" },
  purple: { solid: "bg-purple-600 text-white",  outline: "border border-purple-500 text-purple-400", subtle: "bg-purple-900/40 text-purple-400" },
}

export function Badge({ color = "teal", variant = "subtle", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colorMap[color][variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
