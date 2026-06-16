const stats = [
  { value: "3×", label: "more Google reviews", color: "text-clarity-400" },
  { value: "68%", label: "WhatsApp reply rate", color: "text-trust-400" },
  { value: "40%", label: "repeat visit increase", color: "text-growth-400" },
  { value: "10 min", label: "setup time", color: "text-clarity-400" },
]

export function StatsBar() {
  return (
    <section className="bg-deep-navy border-y border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className={`text-4xl font-bold mb-1 ${stat.color}`}
                style={{ textShadow: `0 0 20px currentColor` }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-text-secondary">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
