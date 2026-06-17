"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Phone } from "lucide-react"

interface ReferralLandingFormProps {
  code: string
}

export function ReferralLandingForm({ code }: ReferralLandingFormProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/referrals/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      setDone(true)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="text-sm text-text-secondary">
          You&apos;re in! Mention your name on your first visit to claim your points.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        theme="dark"
        label="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        icon={<User size={15} />}
        required
      />
      <Input
        theme="dark"
        label="Phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        icon={<Phone size={15} />}
        required
      />
      {error && <p className="text-center text-xs text-red-400">{error}</p>}
      <Button type="submit" variant="primary" glow className="w-full mt-1" disabled={loading}>
        {loading ? "Submitting…" : "Claim my invite"}
      </Button>
    </form>
  )
}
