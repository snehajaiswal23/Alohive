"use client"
import { useEffect, useState } from "react"
import { StaffTopbar } from "@/components/staff/staff-topbar"
import { DashCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Phone, IndianRupee, CheckCircle, ChevronRight } from "lucide-react"

interface ServiceOption { id: string; name: string }
interface StylistOption { id: string; name: string }

interface FoundCustomer {
  id: string
  name: string
  totalVisits: number
  loyaltyPoints: number
  lastVisitAt: string | null
}

type Step = "phone" | "details" | "done"

interface LogVisitClientProps {
  businessId: string
  services: ServiceOption[]
  stylists: StylistOption[]
}

function formatLastVisit(iso: string | null) {
  if (!iso) return "First visit"
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return "Today"
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

export function LogVisitClient({ businessId, services, stylists }: LogVisitClientProps) {
  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [looking, setLooking] = useState(false)
  const [customer, setCustomer] = useState<FoundCustomer | null>(null)
  const [lookedUp, setLookedUp] = useState(false)
  const [newName, setNewName] = useState("")

  const [serviceId, setServiceId] = useState("")
  const [staffId, setStaffId] = useState("")
  const [bill, setBill] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ customerName: string; pointsAwarded: number; isNewCustomer: boolean } | null>(null)

  const digits = phone.replace(/\D/g, "")

  useEffect(() => {
    if (digits.length < 10) {
      setCustomer(null)
      setLookedUp(false)
      return
    }
    let cancelled = false
    setLooking(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/business/${businessId}/customers/lookup?phone=${digits}`)
        const data = await res.json()
        if (cancelled) return
        setCustomer(data.customer || null)
        setLookedUp(true)
      } catch {
        if (!cancelled) setLookedUp(true)
      } finally {
        if (!cancelled) setLooking(false)
      }
    }, 400)
    return () => { cancelled = true; clearTimeout(t) }
  }, [digits, businessId])

  const isNew = lookedUp && !customer
  const canContinue = lookedUp && (customer || newName.trim().length > 0)

  async function confirm() {
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch(`/api/business/${businessId}/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: digits,
          customerName: customer ? undefined : newName.trim(),
          serviceId,
          staffId: staffId || undefined,
          billAmount: bill ? Number(bill) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      setResult({
        customerName: data.customer.name,
        pointsAwarded: data.pointsAwarded,
        isNewCustomer: data.isNewCustomer,
      })
      setStep("done")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setStep("phone")
    setPhone("")
    setCustomer(null)
    setLookedUp(false)
    setNewName("")
    setServiceId("")
    setStaffId("")
    setBill("")
    setError("")
    setResult(null)
  }

  return (
    <div>
      <StaffTopbar title="Log visit" subtitle="Check in a customer and send WhatsApp" alertCount={2} />
      <div className="p-6 max-w-md space-y-5">

        {/* Progress breadcrumb */}
        {step !== "done" && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className={cn("font-medium", step === "phone" ? "text-trust-600" : "text-gray-400")}>1 Phone</span>
            <ChevronRight size={12} />
            <span className={cn("font-medium", step === "details" ? "text-trust-600" : "text-gray-400")}>2 Details</span>
            <ChevronRight size={12} />
            <span className="font-medium text-gray-300">3 Confirm</span>
          </div>
        )}

        {/* Step 1 — Phone */}
        {step === "phone" && (
          <DashCard className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Customer phone number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm border border-gray-200 focus:border-trust-400 focus:ring-1 focus:ring-trust-400/20 outline-none transition-all"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {looking && <p className="text-xs text-gray-400">Looking up customer…</p>}

            {customer && (
              <div className="flex items-start gap-3 bg-trust-50 border border-trust-200 rounded-lg p-4">
                <div className="w-9 h-9 rounded-full bg-trust-200 flex items-center justify-center text-sm font-bold text-trust-700 shrink-0">
                  {customer.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm mb-0.5">{customer.name}</p>
                  <p className="text-xs text-gray-500">
                    {customer.totalVisits} visits · {customer.loyaltyPoints.toLocaleString()} pts · Last: {formatLastVisit(customer.lastVisitAt)}
                  </p>
                </div>
              </div>
            )}

            {isNew && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">New customer — enter their name to continue</p>
                <Input
                  theme="light"
                  placeholder="Customer name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
            )}

            <Button variant="secondary" className="w-full" disabled={!canContinue} onClick={() => setStep("details")}>
              Continue →
            </Button>
          </DashCard>
        )}

        {/* Step 2 — Service / Staff / Bill */}
        {step === "details" && (
          <DashCard className="space-y-5">
            {/* Service grid */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Service</label>
              {services.length === 0 ? (
                <p className="text-xs text-gray-400">No services configured yet. Add one in Settings.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {services.map((s) => (
                    <button key={s.id} onClick={() => setServiceId(s.id)}
                      className={cn("text-xs py-2 px-1 rounded-lg border text-center transition-all",
                        serviceId === s.id ? "border-trust-500 bg-trust-50 text-trust-700 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Staff row */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Staff member <span className="text-gray-400">(optional)</span></label>
              {stylists.length === 0 ? (
                <p className="text-xs text-gray-400">No stylists configured yet. Add one in Settings.</p>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {stylists.map((s) => (
                    <button key={s.id} onClick={() => setStaffId(staffId === s.id ? "" : s.id)}
                      className={cn("flex-1 text-xs py-2 px-2 rounded-lg border text-center transition-all",
                        staffId === s.id ? "border-trust-500 bg-trust-50 text-trust-700 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                      {s.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bill */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Bill amount <span className="text-gray-400">(optional)</span></label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="number" placeholder="e.g. 1500" value={bill} onChange={(e) => setBill(e.target.value)}
                  className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm border border-gray-200 focus:border-trust-400 focus:ring-1 focus:ring-trust-400/20 outline-none transition-all" />
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1 border-gray-200 text-gray-700 rounded-lg" onClick={() => setStep("phone")}>Back</Button>
              <Button variant="secondary" className="flex-1" disabled={!serviceId || submitting} onClick={confirm}>
                {submitting ? "Saving…" : "Confirm & send WA"}
              </Button>
            </div>
          </DashCard>
        )}

        {/* Done */}
        {step === "done" && result && (
          <DashCard className="text-center py-10 space-y-3">
            <div className="w-16 h-16 rounded-full bg-growth-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-growth-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Visit logged!</h2>
            <p className="text-sm text-gray-500">WhatsApp feedback message will be sent shortly…</p>
            <p className="text-xs text-gray-400">+{result.pointsAwarded} loyalty points credited to {result.customerName}</p>
            <Button variant="secondary" onClick={reset} className="mt-2">Log another visit</Button>
          </DashCard>
        )}
      </div>
    </div>
  )
}
