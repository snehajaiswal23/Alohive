"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone } from "lucide-react"

export function CtaSection() {
  const [phone, setPhone] = useState("")
  const router = useRouter()

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Aurora gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-deep-navy to-obsidian" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(16,185,129,0.3) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
          Ready to grow your business?
        </h2>
        <p className="text-lg text-text-secondary mb-10">
          Join hundreds of businesses already growing with Alohive.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
          <Input
            theme="dark"
            placeholder="Your WhatsApp number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone size={16} />}
            className="flex-1"
          />
          <Button
            variant="primary"
            glow
            onClick={() => router.push("/login")}
            className="shrink-0"
          >
            Get started free
          </Button>
        </div>

        <p className="text-xs text-text-tertiary">No credit card required · Cancel anytime</p>
      </div>
    </section>
  )
}
