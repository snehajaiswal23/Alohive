"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

type Tab = "owner" | "staff"

export function LoginForm() {
  const [tab, setTab] = useState<Tab>("owner")
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    router.push(tab === "owner" ? "/dashboard" : "/staff")
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 py-12">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(45,212,191,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md glass-card rounded-[16px] p-8 relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">
            Al<span className="text-clarity-400">o</span>hive
          </h1>
          <p className="text-sm text-text-secondary mt-1">Welcome back</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-white/5 p-1 mb-8">
          {(["owner", "staff"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200",
                tab === t
                  ? "bg-white/10 text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {t === "owner" ? "Owner login" : "Staff login"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            theme="dark"
            label="Email"
            type="email"
            placeholder="you@yourbusiness.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={15} />}
            required
          />

          <div className="relative">
            <Input
              theme="dark"
              label="Password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={15} />}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-[38px] text-text-tertiary hover:text-text-secondary"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-xs text-clarity-400 hover:text-clarity-300">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            variant={tab === "owner" ? "primary" : "secondary"}
            glow={tab === "owner"}
            className="w-full mt-1"
            disabled={loading}
          >
            {loading ? "Signing in…" : tab === "owner" ? "Sign in" : "Sign in as staff"}
          </Button>
        </form>

        {tab === "owner" && (
          <p className="text-center text-xs text-text-secondary mt-6">
            New here?{" "}
            <Link href="/signup" className="text-clarity-400 hover:text-clarity-300">
              Create your business account
            </Link>
          </p>
        )}
        {tab === "staff" && (
          <p className="text-center text-xs text-text-secondary mt-6">
            Owner?{" "}
            <button onClick={() => setTab("owner")} className="text-clarity-400 hover:text-clarity-300">
              Switch to owner login
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
