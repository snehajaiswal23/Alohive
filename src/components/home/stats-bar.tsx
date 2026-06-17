"use client"
import { useEffect, useRef, useState } from "react"

const stats = [
  { value: 3,    suffix: "×",    label: "more Google reviews",    color: "text-clarity-400",  glow: "rgba(45,212,191,0.4)"  },
  { value: 68,   suffix: "%",    label: "WhatsApp reply rate",     color: "text-trust-400",    glow: "rgba(96,165,250,0.4)"  },
  { value: 40,   suffix: "%",    label: "repeat visit increase",   color: "text-growth-400",   glow: "rgba(52,211,153,0.4)"  },
  { value: 10,   suffix: " min", label: "average setup time",      color: "text-clarity-400",  glow: "rgba(45,212,191,0.4)"  },
]

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const dur   = 1400
        const start = performance.now()
        const tick  = (now: number) => {
          const t    = Math.min((now - start) / dur, 1)
          const ease = 1 - Math.pow(1 - t, 3)
          setCount(Math.round(ease * target))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])

  return <div ref={ref}>{count}{suffix}</div>
}

export function StatsBar() {
  return (
    <section className="relative bg-deep-navy border-y border-white/5 py-14 overflow-hidden">
      {/* Subtle top glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(45,212,191,0.04) 0%, transparent 70%)" }}
      />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center ${i < 3 ? "md:border-r md:border-white/5" : ""}`}
            >
              <div
                className={`text-4xl md:text-5xl font-display font-bold mb-1.5 tabular-nums ${stat.color}`}
                style={{ textShadow: `0 0 24px ${stat.glow}` }}
              >
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
