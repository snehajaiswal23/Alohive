"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Star, Share2, Copy, Check, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CustomerLoyaltyActionsProps {
  businessId: string
  customerId: string
}

export function CustomerLoyaltyActions({ businessId, customerId }: CustomerLoyaltyActionsProps) {
  const router = useRouter()
  const [openForm, setOpenForm] = useState<"review" | "referral" | null>(null)
  const [rating, setRating] = useState(5)
  const [referredName, setReferredName] = useState("")
  const [referredPhone, setReferredPhone] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const [link, setLink] = useState("")
  const [linkLoading, setLinkLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [sendError, setSendError] = useState("")

  useEffect(() => {
    if (openForm !== "referral" || link) return
    setLinkLoading(true)
    fetch(`/api/business/${businessId}/customers/${customerId}/referral-link`)
      .then((res) => res.json())
      .then((data) => setLink(data.link || ""))
      .finally(() => setLinkLoading(false))
  }, [openForm, link, businessId, customerId])

  async function copyLink() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function sendLinkViaWhatsapp() {
    setSendStatus("sending")
    setSendError("")
    try {
      const res = await fetch(`/api/business/${businessId}/customers/${customerId}/referral-link`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) {
        setSendError(data.error || "Something went wrong")
        setSendStatus("error")
        return
      }
      setSendStatus("sent")
    } catch {
      setSendError("Network error. Please try again.")
      setSendStatus("error")
    }
  }

  function close() {
    setOpenForm(null)
    setError("")
    setReferredName("")
    setReferredPhone("")
    setRating(5)
    setSendStatus("idle")
    setSendError("")
  }

  async function logReview(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/business/${businessId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, rating }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      close()
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function createReferral(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/business/${businessId}/referrals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerCustomerId: customerId, referredName, referredPhone }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      close()
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg" onClick={() => setOpenForm("review")}>
          <Star size={12} /> Log Google review
        </Button>
        <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg" onClick={() => setOpenForm("referral")}>
          <Share2 size={12} /> Refer a friend
        </Button>
      </div>

      {openForm === "review" && (
        <form onSubmit={logReview} className="flex items-end gap-2 border border-gray-100 rounded-lg p-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2"
            >
              {[5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>{s} ★</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" variant="primary" size="sm" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          <Button type="button" variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg" onClick={close}>Cancel</Button>
        </form>
      )}

      {openForm === "referral" && (
        <div className="flex flex-col gap-3 border border-gray-100 rounded-lg p-3">
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1.5">Their unique referral link</p>
            {linkLoading ? (
              <p className="text-xs text-gray-400">Generating link…</p>
            ) : (
              <div className="flex items-center gap-2">
                <input readOnly value={link} className="flex-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50" />
                <Button type="button" variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg" onClick={copyLink}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={sendLinkViaWhatsapp} disabled={sendStatus === "sending"}>
                  <MessageCircle size={12} /> {sendStatus === "sending" ? "Sending…" : sendStatus === "sent" ? "Sent!" : "Send via WhatsApp"}
                </Button>
              </div>
            )}
            {sendStatus === "error" && <p className="text-xs text-red-500 mt-1">{sendError}</p>}
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Or enter their details manually</p>
            <form onSubmit={createReferral} className="flex items-end gap-2">
              <Input theme="light" label="Referred name" value={referredName} onChange={(e) => setReferredName(e.target.value)} required />
              <Input theme="light" label="Referred phone" value={referredPhone} onChange={(e) => setReferredPhone(e.target.value)} required />
              <Button type="submit" variant="primary" size="sm" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            </form>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <Button type="button" variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg" onClick={close}>Close</Button>
        </div>
      )}
    </div>
  )
}
