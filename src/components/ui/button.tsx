"use client"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger"
type Size = "sm" | "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  glow?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-growth-500 text-white hover:bg-growth-600 border-transparent",
  secondary:
    "bg-clarity-500 text-white hover:bg-clarity-600 border-transparent",
  outline:
    "bg-transparent border border-white/20 text-text-primary hover:bg-white/5",
  ghost:
    "bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-white/5",
  danger:
    "bg-red-500 text-white hover:bg-red-600 border-transparent",
}

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm leading-none",
  md: "px-5 py-2.5 text-sm leading-none",
  lg: "px-7 py-3.5 text-base leading-none",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", glow, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-[9999px] border transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        glow && variant === "primary" && "glow-green-btn",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
)
Button.displayName = "Button"
