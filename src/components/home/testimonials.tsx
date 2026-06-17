const testimonials = [
  {
    quote:
      "We went from 40 Google reviews to 180 in three months without asking a single customer manually. The WhatsApp flow just works — customers reply and the review link is right there.",
    name: "Priya Mehta",
    business: "Gloss Studio, Koramangala",
    type: "Salon",
    avatar: "PM",
    avatarBg: "bg-clarity-900/60 border-clarity-500/30 text-clarity-400",
    stars: 5,
  },
  {
    quote:
      "The win-back campaigns brought back 23 customers in the first month who hadn't visited in 60 days. The AI-generated offer messages sound genuinely personal, not spammy.",
    name: "Arjun Nair",
    business: "The Brew House, Indiranagar",
    type: "Cafe",
    avatar: "AN",
    avatarBg: "bg-trust-900/60 border-trust-500/30 text-trust-400",
    stars: 5,
  },
  {
    quote:
      "My receptionist logs every visit in 10 seconds, the loyalty system runs itself, and I get a WhatsApp summary every evening. I finally know what's actually working.",
    name: "Rohan Kapoor",
    business: "Iron Republic, HSR Layout",
    type: "Gym",
    avatar: "RK",
    avatarBg: "bg-growth-900/60 border-growth-500/30 text-growth-400",
    stars: 5,
  },
]

const typeColors: Record<string, string> = {
  Salon: "text-clarity-400 bg-clarity-900/30 border-clarity-500/20",
  Cafe:  "text-trust-400  bg-trust-900/30  border-trust-500/20",
  Gym:   "text-growth-400 bg-growth-900/30 border-growth-500/20",
}

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-obsidian py-28 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-clarity-400 mb-3">Stories</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Trusted by local businesses across India
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Real results from real business owners who replaced five tools with one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card rounded-2xl p-7 flex flex-col gap-5 hover:border-white/10 transition-colors duration-300">
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(t.stars)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-text-secondary leading-relaxed flex-1 italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${t.avatarBg}`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary leading-none mb-1">{t.name}</p>
                    <p className="text-xs text-text-tertiary">{t.business}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeColors[t.type]}`}>
                  {t.type}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof line */}
        <p className="text-center text-sm text-text-tertiary mt-10">
          Businesses using Alohive collect{" "}
          <span className="text-clarity-400 font-semibold">3× more reviews</span>
          {" "}and see{" "}
          <span className="text-growth-400 font-semibold">40% more repeat visits</span>
          {" "}within 60 days.
        </p>
      </div>
    </section>
  )
}
