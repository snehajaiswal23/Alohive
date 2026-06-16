import { WebGLShader } from "@/components/home/webgl-shader"
import { Navbar } from "@/components/home/navbar"
import { HeroSection } from "@/components/home/hero-section"
import { StatsBar } from "@/components/home/stats-bar"
import { HowItWorks } from "@/components/home/how-it-works"
import { FeaturesSection } from "@/components/home/features-section"
import { Testimonials } from "@/components/home/testimonials"
import { PricingSection } from "@/components/home/pricing-section"
import { CtaSection } from "@/components/home/cta-section"
import { Footer } from "@/components/home/footer"

export default function HomePage() {
  return (
    <main className="bg-obsidian">
      <WebGLShader />
      <Navbar />
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <FeaturesSection />
      <Testimonials />
      <PricingSection />
      <CtaSection />
      <Footer />
    </main>
  )
}
