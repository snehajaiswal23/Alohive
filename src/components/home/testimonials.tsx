import { Badge } from "@/components/ui/badge"

const testimonials = [
  {
    quote:
      "We went from 40 Google reviews to 180 in three months without asking a single customer manually. The WhatsApp flow just works — customers reply and the review link is right there.",
    name: "Priya Mehta",
    business: "Gloss Studio, Koramangala",
    type: "Salon",
    color: "teal" as const,
  },
  {
    quote:
      "The win-back campaigns brought back 23 customers in the first month who hadn't visited in 60 days. The AI-generated offer messages sound genuinely personal, not spammy.",
    name: "Arjun Nair",
    business: "The Brew House, Indiranagar",
    type: "Cafe",
    color: "blue" as const,
  },
  {
    quote:
      "My receptionist logs every visit in 10 seconds, the loyalty system runs itself, and I get a WhatsApp summary every evening. I finally know what's working at my gym.",
    name: "Rohan Kapoor",
    business: "Iron Republic, HSR Layout",
    type: "Gym",
    color: "green" as const,
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-obsidian py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Trusted by local businesses across India
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Real results from real business owners who replaced five tools with one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card rounded-[12px] p-7 flex flex-col gap-4">
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-sm text-text-secondary italic leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-tertiary">{t.business}</p>
                </div>
                <Badge color={t.color} variant="subtle">{t.type}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
