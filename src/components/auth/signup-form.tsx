"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Building2, User, Mail, Phone, Lock, MapPin, Link as LinkIcon } from "lucide-react"

const BUSINESS_TYPES = [
  { id: "salon", label: "Salon", icon: "✂️" },
  { id: "cafe", label: "Cafe", icon: "☕" },
  { id: "restaurant", label: "Restaurant", icon: "🍽️" },
  { id: "gym", label: "Gym", icon: "💪" },
  { id: "clinic", label: "Clinic", icon: "🏥" },
  { id: "retail", label: "Retail", icon: "🛍️" },
]

const PLANS = [
  { id: "starter", name: "Starter", price: "₹999/mo" },
  { id: "growth", name: "Growth", price: "₹2,499/mo", popular: true },
  { id: "trial", name: "Free Trial", price: "14 days free" },
]

export function SignupForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    businessType: "",
    city: "",
    locality: "",
    googleReviewLink: "",
    whatsappNumber: "",
    plan: "trial",
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const canContinue =
    step === 1
      ? form.businessName && form.ownerName && form.email && form.phone && form.password.length >= 8
      : step === 2
      ? !!form.businessType
      : step === 3
      ? !!form.city
      : true

  const handleFinish = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      router.push("/dashboard")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const steps = ["Business details", "Business type", "Location & links", "Choose plan"]

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 py-12">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(16,185,129,0.04) 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-lg glass-card rounded-[16px] p-8 relative">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Al<span className="text-clarity-400">o</span>hive</h1>
          <p className="text-sm text-text-secondary mt-1">Create your business account</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  step > i + 1
                    ? "bg-growth-500 text-white"
                    : step === i + 1
                    ? "bg-clarity-500 text-white"
                    : "bg-white/10 text-text-tertiary",
                )}
              >
                {step > i + 1 ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn("h-px flex-1 mx-1 transition-all", step > i + 1 ? "bg-growth-500" : "bg-white/10")} style={{ width: "20px" }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Input theme="dark" label="Business name" placeholder="Gloss Studio" value={form.businessName} onChange={set("businessName")} icon={<Building2 size={15} />} />
            <Input theme="dark" label="Your name" placeholder="Priya Mehta" value={form.ownerName} onChange={set("ownerName")} icon={<User size={15} />} />
            <Input theme="dark" label="Email" type="email" placeholder="priya@glossstudio.com" value={form.email} onChange={set("email")} icon={<Mail size={15} />} />
            <Input theme="dark" label="Phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} icon={<Phone size={15} />} />
            <Input theme="dark" label="Password" type="password" placeholder="Min 8 characters" value={form.password} onChange={set("password")} icon={<Lock size={15} />} />
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <p className="text-sm text-text-secondary mb-4">What type of business do you run?</p>
            <div className="grid grid-cols-3 gap-3">
              {BUSINESS_TYPES.map((bt) => (
                <button
                  key={bt.id}
                  onClick={() => setForm((f) => ({ ...f, businessType: bt.id }))}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-[12px] border transition-all duration-200",
                    form.businessType === bt.id
                      ? "border-clarity-500 bg-clarity-900/30 text-text-primary"
                      : "border-white/10 bg-white/3 text-text-secondary hover:border-white/20",
                  )}
                >
                  <span className="text-2xl">{bt.icon}</span>
                  <span className="text-xs font-medium">{bt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <Input theme="dark" label="City" placeholder="Bangalore" value={form.city} onChange={set("city")} icon={<MapPin size={15} />} />
            <Input theme="dark" label="Locality / area" placeholder="Koramangala" value={form.locality} onChange={set("locality")} icon={<MapPin size={15} />} />
            <Input theme="dark" label="Google Review link (optional)" placeholder="maps.google.com/..." value={form.googleReviewLink} onChange={set("googleReviewLink")} icon={<LinkIcon size={15} />} />
            <Input theme="dark" label="WhatsApp number" placeholder="+91 98765 43210" value={form.whatsappNumber} onChange={set("whatsappNumber")} icon={<Phone size={15} />} />
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-text-secondary mb-1">Choose your plan:</p>
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setForm((f) => ({ ...f, plan: plan.id }))}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-[12px] border transition-all",
                  form.plan === plan.id
                    ? "border-growth-500 bg-growth-900/20 text-text-primary"
                    : "border-white/10 bg-white/3 text-text-secondary hover:border-white/20",
                )}
              >
                <span className="font-medium text-sm">{plan.name}</span>
                <div className="flex items-center gap-2">
                  {plan.popular && <span className="text-xs bg-growth-500 text-white px-2 py-0.5 rounded-full">Popular</span>}
                  <span className="text-sm font-bold text-text-primary">{plan.price}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="text-center text-xs text-red-400 mt-4 -mb-2">{error}</p>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)} className="flex-1" disabled={!canContinue}>
              Continue
            </Button>
          ) : (
            <Button variant="primary" glow onClick={handleFinish} className="flex-1" disabled={loading}>
              {loading ? "Creating account…" : "Create account & start trial"}
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-text-secondary mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-clarity-400 hover:text-clarity-300">Sign in</a>
        </p>
      </div>
    </div>
  )
}
