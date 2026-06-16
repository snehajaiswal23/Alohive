"use client"
import { useState } from "react"
import { StaffTopbar } from "@/components/staff/staff-topbar"
import { DashCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Phone, IndianRupee, CheckCircle, ChevronRight } from "lucide-react"

const SERVICES = ["Haircut", "Hair color", "Hair spa", "Facial", "Manicure", "Pedicure", "Blowdry", "Threading"]
const STAFF    = ["Priya Mehta", "Kavya Rao", "Sneha Iyer"]

const KNOWN = { name: "Aditi Sharma", tier: "Gold", visits: 14, points: 1420, lastVisit: "3 days ago" }

type Step = "phone" | "details" | "done"

export default function LogVisitPage() {
  const [step, setStep]       = useState<Step>("phone")
  const [phone, setPhone]     = useState("")
  const [found, setFound]     = useState(false)
  const [service, setService] = useState("")
  const [staff, setStaff]     = useState("")
  const [bill, setBill]       = useState("")
  const [countdown, setCount] = useState(5)

  const onPhoneChange = (v: string) => {
    setPhone(v)
    setFound(v.replace(/\D/g, "").length >= 10)
  }

  const confirm = () => {
    setStep("done")
    let c = 5
    const t = setInterval(() => { if (--c === 0) clearInterval(t); setCount(c) }, 1000)
  }

  const reset = () => { setStep("phone"); setPhone(""); setFound(false); setService(""); setStaff(""); setBill(""); setCount(5) }

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
                  onChange={e => onPhoneChange(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {found && (
              <div className="flex items-start gap-3 bg-trust-50 border border-trust-200 rounded-lg p-4">
                <div className="w-9 h-9 rounded-full bg-trust-200 flex items-center justify-center text-sm font-bold text-trust-700 shrink-0">{KNOWN.name[0]}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-800 text-sm">{KNOWN.name}</p>
                    <Badge color="amber" variant="subtle">{KNOWN.tier}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">{KNOWN.visits} visits · {KNOWN.points.toLocaleString()} pts · Last: {KNOWN.lastVisit}</p>
                </div>
              </div>
            )}

            <Button variant="secondary" className="w-full" disabled={!found} onClick={() => setStep("details")}>
              Continue →
            </Button>
            {!found && phone.length > 0 && (
              <p className="text-xs text-center text-gray-400">New customer — keep typing to continue</p>
            )}
          </DashCard>
        )}

        {/* Step 2 — Service / Staff / Bill */}
        {step === "details" && (
          <DashCard className="space-y-5">
            {/* Service grid */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Service</label>
              <div className="grid grid-cols-4 gap-2">
                {SERVICES.map(s => (
                  <button key={s} onClick={() => setService(s)}
                    className={cn("text-xs py-2 px-1 rounded-lg border text-center transition-all",
                      service === s ? "border-trust-500 bg-trust-50 text-trust-700 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Staff row */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Staff member</label>
              <div className="flex gap-2">
                {STAFF.map(s => (
                  <button key={s} onClick={() => setStaff(s)}
                    className={cn("flex-1 text-xs py-2 rounded-lg border text-center transition-all",
                      staff === s ? "border-trust-500 bg-trust-50 text-trust-700 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                    {s.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Bill */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Bill amount <span className="text-gray-400">(optional)</span></label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="number" placeholder="e.g. 1500" value={bill} onChange={e => setBill(e.target.value)}
                  className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm border border-gray-200 focus:border-trust-400 focus:ring-1 focus:ring-trust-400/20 outline-none transition-all" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1 border-gray-200 text-gray-700 rounded-lg" onClick={() => setStep("phone")}>Back</Button>
              <Button variant="secondary" className="flex-1" disabled={!service} onClick={confirm}>Confirm &amp; send WA</Button>
            </div>
          </DashCard>
        )}

        {/* Done */}
        {step === "done" && (
          <DashCard className="text-center py-10 space-y-3">
            <div className="w-16 h-16 rounded-full bg-growth-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-growth-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Visit logged!</h2>
            <p className="text-sm text-gray-500">WhatsApp feedback message sending{countdown > 0 ? ` in ${countdown}s` : " now"}…</p>
            <p className="text-xs text-gray-400">+10 loyalty points credited to {KNOWN.name}</p>
            <Button variant="secondary" onClick={reset} className="mt-2">Log another visit</Button>
          </DashCard>
        )}
      </div>
    </div>
  )
}
