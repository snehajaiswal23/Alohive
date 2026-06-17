"use client"
import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [devResetUrl, setDevResetUrl] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      setSent(true)
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl)
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
          <p className="text-sm text-text-secondary mt-1">Reset your password</p>
        </div>

        {sent ? (
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              If an account exists for <span className="text-text-primary">{email}</span>, a reset link has been
              sent.
            </p>
            {devResetUrl && (
              <p className="text-xs text-text-tertiary mt-4 break-all">
                Dev mode (no email provider configured):{" "}
                <Link href={devResetUrl} className="text-clarity-400 hover:text-clarity-300">
                  {devResetUrl}
                </Link>
              </p>
            )}
          </div>
        ) : (
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

            <Button type="submit" variant="primary" glow className="w-full mt-1" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        {error && <p className="text-center text-xs text-red-400 mt-4">{error}</p>}

        <p className="text-center text-xs text-text-secondary mt-6">
          <Link href="/login" className="text-clarity-400 hover:text-clarity-300">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
