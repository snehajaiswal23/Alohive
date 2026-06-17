"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, ArrowRight } from "lucide-react"

const bullets = [
  "14-day free trial, no card needed",
  "Setup in under 10 minutes",
  "Cancel anytime",
]

export function CtaSection() {
  const [phone, setPhone] = useState("")
  const router = useRouter()

  return (
    <section className="relative py-28 px-6 overflow-hidden bg-obsidian">
      {/* Aurora behind */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 90% 60% at 50% 100%, rgba(16,185,129,0.12) 0%, transparent 70%)",
            "radial-gradient(ellipse 60% 40% at 20% 50%, rgba(45,212,191,0.06) 0%, transparent 60%)",
            "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(96,165,250,0.06) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      <div className="relative max-w-3xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-growth-400 mb-4">Get started today</p>

        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-5">
          Ready to grow your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-clarity-400 to-growth-400">
            local business?
          </span>
        </h2>

        <p className="text-lg text-text-secondary mb-10 max-w-lg mx-auto leading-relaxed">
          Join hundreds of salons, cafes, gyms, and clinics already growing with Alohive.
        </p>

        {/* Input + CTA */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
          <Input
            theme="dark"
            placeholder="Your WhatsApp number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone size={15} />}
            className="flex-1"
          />
          <Button
            variant="primary"
            glow
            onClick={() => router.push("/login")}
            className="shrink-0 font-semibold flex items-center gap-2"
          >
            Start free <ArrowRight size={15} />
          </Button>
        </div>

        {/* Bullets */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {bullets.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs text-text-tertiary">
              <span className="w-1 h-1 rounded-full bg-growth-500/60" />
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
