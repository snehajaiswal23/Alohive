import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean
  glow?: "teal" | "blue" | "green"
}

export function Card({ glass, glow, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[12px] p-6",
        glass
          ? "glass-card"
          : "bg-deep-navy border border-slate-800",
        glow === "teal" && "glow-teal",
        glow === "blue" && "glow-blue",
        glow === "green" && "glow-green",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DashCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[12px] p-6 bg-white border border-gray-200 shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
