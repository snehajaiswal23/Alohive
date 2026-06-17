"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, Eye, EyeOff } from "lucide-react"

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? ""
  const [showPw, setShowPw] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      router.push("/login")
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
          <p className="text-sm text-text-secondary mt-1">Choose a new password</p>
        </div>

        {!token ? (
          <p className="text-center text-sm text-red-400">
            Missing reset token. Use the link from your email, or{" "}
            <Link href="/forgot-password" className="text-clarity-400 hover:text-clarity-300">
              request a new one
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Input
                theme="dark"
                label="New password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={15} />}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-[38px] text-text-tertiary hover:text-text-secondary"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <Input
              theme="dark"
              label="Confirm new password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={15} />}
              required
              minLength={8}
            />

            <Button type="submit" variant="primary" glow className="w-full mt-1" disabled={loading}>
              {loading ? "Resetting…" : "Reset password"}
            </Button>
          </form>
        )}

        {error && <p className="text-center text-xs text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  )
}
