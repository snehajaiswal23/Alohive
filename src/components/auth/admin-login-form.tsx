"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"

type Step = "credentials" | "totp"

export function AdminLoginForm() {
  const [step, setStep] = useState<Step>("credentials")
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [totpCode, setTotpCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      if (data.requires2FA) {
        setStep("totp")
      } else {
        router.push("/admin")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleTotp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: totpCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Invalid code")
        return
      }
      router.push("/admin")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 py-12">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(45,212,191,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md glass-card rounded-[16px] p-8 relative">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">
            Al<span className="text-clarity-400">o</span>hive
          </h1>
          <p className="text-sm text-text-secondary mt-1">Platform admin</p>
        </div>

        {step === "credentials" ? (
          <form onSubmit={handleCredentials} className="flex flex-col gap-4">
            <Input
              theme="dark"
              label="Email"
              type="email"
              placeholder="admin@alohive.in"
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

            <Button type="submit" variant="primary" glow className="w-full mt-1" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleTotp} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-900/20 border border-teal-800/40 mb-2">
              <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
              <p className="text-xs text-text-secondary">
                Open your authenticator app and enter the 6-digit code for <span className="text-text-primary">{email}</span>.
              </p>
            </div>

            <Input
              theme="dark"
              label="Authenticator code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              placeholder="000000"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
              icon={<ShieldCheck size={15} />}
              autoFocus
              required
            />

            <Button type="submit" variant="primary" glow className="w-full mt-1" disabled={loading || totpCode.length !== 6}>
              {loading ? "Verifying…" : "Verify"}
            </Button>

            <button
              type="button"
              onClick={() => { setStep("credentials"); setTotpCode(""); setError("") }}
              className="text-xs text-text-tertiary hover:text-text-secondary text-center transition-colors"
            >
              Back to login
            </button>
          </form>
        )}

        {error && <p className="text-center text-xs text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  )
}
