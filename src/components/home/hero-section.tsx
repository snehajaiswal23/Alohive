import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Eyebrow badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-clarity-500/40 text-clarity-400 text-xs font-medium mb-6 bg-clarity-900/20">
        <span className="w-1.5 h-1.5 rounded-full bg-clarity-400 animate-pulse" />
        WhatsApp-first growth platform
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-tight max-w-4xl mb-6">
        Turn every visit into a{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-clarity-400 to-growth-400">
          customer who stays
        </span>
      </h1>

      {/* Subtext */}
      <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed">
        Alohive automates reviews, loyalty, and win-back campaigns over WhatsApp — so your salon,
        cafe, or gym grows without a marketing team.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-12">
        <Link href="/login">
          <Button variant="primary" size="lg" glow>
            Get started free
          </Button>
        </Link>
        <a href="#how-it-works">
          <Button variant="outline" size="lg">
            See how it works
          </Button>
        </a>
      </div>

      {/* Trust indicators */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-secondary">
        {["No tech skills needed", "Setup in 10 mins", "Works on any phone"].map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="w-1 h-1 rounded-full bg-clarity-500 hidden sm:block" />}
            <span className="w-1.5 h-1.5 rounded-full bg-clarity-400" />
            {item}
          </span>
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-tertiary animate-bounce">
        <ChevronDown size={20} />
      </div>
    </section>
  )
}
