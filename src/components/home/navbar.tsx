"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "For Businesses", href: "#testimonials" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-obsidian/80 backdrop-blur-md border-b border-white/5 shadow-lg" : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <span className="font-display text-2xl font-bold text-text-primary tracking-tight leading-none">
            Al
            <span className="relative inline-block">
              <span className="text-clarity-400">o</span>
              <span
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: "0 0 8px 2px rgba(45,212,191,0.5)", borderRadius: "50%" }}
              />
            </span>
            hive
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-[13px] font-medium leading-none tracking-wide text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              {link.label}
              <span className="absolute left-0 -bottom-1.5 h-px w-0 bg-clarity-400 transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-medium tracking-wide">Sign in</Button>
          </Link>
          <span className="h-5 w-px bg-white/10" />
          <Link href="/login">
            <Button variant="primary" size="sm" glow className="font-semibold tracking-wide">Start free trial</Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-text-secondary hover:text-text-primary"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-obsidian/95 backdrop-blur-md border-t border-white/5 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm font-medium tracking-wide text-text-secondary hover:text-text-primary py-2"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login"><Button variant="outline" className="w-full">Sign in</Button></Link>
            <Link href="/login"><Button variant="primary" glow className="w-full">Start free trial</Button></Link>
          </div>
        </div>
      )}
    </nav>
  )
}
