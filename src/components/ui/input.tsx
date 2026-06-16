import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  theme?: "dark" | "light"
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ theme = "dark", label, error, icon, className, ...props }, ref) => {
    const base =
      theme === "dark"
        ? "bg-white/5 border border-white/10 text-text-primary placeholder:text-text-tertiary focus:border-clarity-500 focus:ring-1 focus:ring-clarity-500/30"
        : "bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-clarity-500 focus:ring-1 focus:ring-clarity-500/30"

    return (
      <div className="w-full">
        {label && (
          <label className={cn("block text-sm font-medium mb-1.5", theme === "dark" ? "text-text-secondary" : "text-gray-700")}>
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-[8px] px-4 py-2.5 text-sm outline-none transition-all duration-200",
              icon && "pl-10",
              base,
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    )
  },
)
Input.displayName = "Input"
