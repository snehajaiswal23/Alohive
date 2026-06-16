const steps = [
  { n: 1, title: "Customer visits your business", desc: "A walk-in visit, appointment, or delivery — any touchpoint counts." },
  { n: 2, title: "They get a WhatsApp message", desc: "30 minutes after checkout, a warm branded message arrives on their phone." },
  { n: 3, title: "Feedback captured privately", desc: "Happy customers get a Google review link. Unhappy feedback stays private." },
  { n: 4, title: "They earn loyalty points", desc: "Points auto-credited for every visit, review, or referral. No app needed." },
  { n: 5, title: "AI brings back inactive customers", desc: "Win-back campaigns auto-fire when customers go quiet for 30, 60, or 90 days." },
  { n: 6, title: "You see everything in one dashboard", desc: "Reviews, visits, loyalty, campaigns — one clean view for the whole business." },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-obsidian py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-clarity-400 mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Simple for you, powerful for your business
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Set up once in 10 minutes. Alohive runs the growth engine while you focus on serving customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((step) => (
            <div key={step.n} className="glass-card rounded-[12px] p-6 hover:border-clarity-500/20 transition-colors duration-300">
              <div className="w-7 h-7 rounded-full bg-clarity-900/50 border border-clarity-500/30 text-clarity-400 text-xs font-bold flex items-center justify-center mb-4">
                {step.n}
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">{step.title}</h3>
              <p className="text-[13.5px] text-text-secondary leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
