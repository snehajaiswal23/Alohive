"use client"
import { useState } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { DashCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Send, TrendingDown, Users, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = { role: "user" | "ai"; text: string }

const SUGGESTIONS = [
  "Why is revenue down this month?",
  "Who might churn soon?",
  "Best campaign to run this week?",
  "Which services are most popular?",
  "How can I improve my Google rating?",
]

const RESPONSES: Record<string, string> = {
  "Why is revenue down this month?":
    "Revenue is down 8% vs last month. Key drivers: (1) 12 fewer repeat visits from Silver-tier customers — likely due to the price increase on hair treatments on Jan 1st. (2) Tuesday footfall dropped 22% — consider a Tuesday-specific offer. Recommendation: run a win-back campaign targeting the 12 Silver customers who haven't returned since December.",
  "Who might churn soon?":
    "I've identified 8 customers at high churn risk: 4 Gold-tier customers haven't visited in 25+ days (near the 30-day inactive threshold). Notable: Ravi Kumar and Meera Nair both visited 5+ times before going quiet — worth a personal win-back message. Send now?",
  "Best campaign to run this week?":
    "Based on your data, I recommend: **Weekend Flash Sale** — target the 18 Silver customers who haven't visited in 20-25 days (before they go inactive). Offer: 15% off any service, valid Sat-Sun only. Expected recovery: 4-6 customers. Estimated revenue: ₹6,000–₹9,000.",
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hi Priya! I'm your Alohive AI assistant. Ask me anything about your business — revenue, customers, campaigns, or growth ideas." },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    setMessages((m) => [...m, { role: "user", text }])
    setInput("")
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    const reply = RESPONSES[text] ?? "I'm analysing your business data… I'd recommend looking at your top 5 loyal customers and checking if any have gone quiet this month. Would you like me to run that analysis?"
    setMessages((m) => [...m, { role: "ai", text: reply }])
    setLoading(false)
  }

  return (
    <div>
      <Topbar title="AI Assistant" subtitle="Ask anything about your business" />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Chat */}
          <DashCard className="flex flex-col h-[480px]">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold", m.role === "ai" ? "bg-clarity-100 text-clarity-700" : "bg-gray-800 text-white")}>
                    {m.role === "ai" ? <Bot size={14} /> : "P"}
                  </div>
                  <div className={cn("max-w-[80%] rounded-[12px] px-4 py-3 text-sm leading-relaxed", m.role === "ai" ? "bg-gray-50 text-gray-800" : "bg-clarity-600 text-white")}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-clarity-100 flex items-center justify-center">
                    <Bot size={14} className="text-clarity-700" />
                  </div>
                  <div className="bg-gray-50 rounded-[12px] px-4 py-3">
                    <div className="flex gap-1">
                      {[0,1,2].map((i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-gray-100 pt-4">
              <input
                className="flex-1 rounded-[8px] px-3 py-2.5 text-sm border border-gray-200 focus:border-clarity-500 focus:ring-1 focus:ring-clarity-500/20 outline-none"
                placeholder="Ask anything about your business…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
              />
              <Button variant="primary" size="sm" onClick={() => send(input)} disabled={loading}>
                <Send size={14} />
              </Button>
            </div>
          </DashCard>

          {/* Suggestion chips */}
          <DashCard>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} className="text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-700">Try asking:</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-clarity-400 hover:text-clarity-700 hover:bg-clarity-50 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </DashCard>
        </div>
      </div>
    </div>
  )
}
