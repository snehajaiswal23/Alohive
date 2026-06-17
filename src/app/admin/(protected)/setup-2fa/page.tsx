"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldCheck, ShieldOff, Copy } from "lucide-react"
import QRCode from "qrcode"

export default function Setup2FA() {
  const [uri, setUri] = useState("")
  const [secret, setSecret] = useState("")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [alreadyEnabled, setAlreadyEnabled] = useState(false)

  useEffect(() => {
    fetch("/api/admin/auth/setup-2fa")
      .then((r) => r.json())
      .then(async (d) => {
        if (d.alreadyEnabled) { setAlreadyEnabled(true); return }
        setSecret(d.secret)
        setUri(d.uri)
        if (d.uri) {
          const dataUrl = await QRCode.toDataURL(d.uri, { width: 200, margin: 1, color: { dark: "#ffffff", light: "#0f1117" } })
          setQrDataUrl(dataUrl)
        }
      })
  }, [])

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus("idle")
    const res = await fetch("/api/admin/auth/setup-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    if (res.ok) {
      setStatus("success")
      setMessage("2FA enabled. You'll be prompted for your authenticator code on every login.")
      setAlreadyEnabled(true)
    } else {
      setStatus("error")
      setMessage(data.error ?? "Verification failed")
    }
    setLoading(false)
  }

  if (alreadyEnabled && status !== "success") {
    return (
      <div className="p-6 max-w-lg">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-5 h-5 text-growth-400" />
          <h1 className="text-xl font-bold text-text-primary">2FA is active</h1>
        </div>
        <Card glass>
          <p className="text-sm text-text-secondary">Two-factor authentication is already enabled on your account. You&apos;ll be prompted for a code from your authenticator app on each login.</p>
          <p className="text-xs text-text-tertiary mt-3">To disable 2FA, contact another admin or use the API endpoint with your current TOTP code.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-2 mb-6">
        <ShieldOff className="w-5 h-5 text-amber-400" />
        <h1 className="text-xl font-bold text-text-primary">Set up 2FA</h1>
      </div>

      <div className="space-y-5">
        <Card glass>
          <p className="text-sm font-medium text-text-primary mb-1">Step 1 — Scan with your authenticator app</p>
          <p className="text-xs text-text-secondary mb-4">Use Google Authenticator, Authy, or 1Password.</p>
          {qrDataUrl ? (
            <div className="flex flex-col items-center gap-4">
              <img src={qrDataUrl} alt="TOTP QR code" className="rounded-lg" width={200} height={200} />
              <div className="w-full">
                <p className="text-xs text-text-tertiary mb-1">Or enter this secret manually:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white/5 rounded px-3 py-2 font-mono text-text-secondary break-all">{secret}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(secret)}
                    className="text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-text-tertiary text-sm">Loading QR…</div>
          )}
        </Card>

        <Card glass>
          <p className="text-sm font-medium text-text-primary mb-1">Step 2 — Verify the code</p>
          <p className="text-xs text-text-secondary mb-4">Enter the 6-digit code from your app to confirm setup.</p>
          <form onSubmit={verify} className="flex flex-col gap-3">
            <Input
              theme="dark"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              autoFocus
            />
            <Button type="submit" variant="primary" glow disabled={loading || code.length !== 6}>
              {loading ? "Verifying…" : "Enable 2FA"}
            </Button>
          </form>
        </Card>

        {status === "success" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-900/20 border border-green-800/40">
            <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
            <p className="text-sm text-green-300">{message}</p>
          </div>
        )}
        {status === "error" && (
          <p className="text-sm text-red-400">{message}</p>
        )}
      </div>
    </div>
  )
}
