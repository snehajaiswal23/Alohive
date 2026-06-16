import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Edit, Send } from "lucide-react"

const templates = [
  { name: "post_visit_feedback", category: "Utility", status: "approved", body: "Hi {{1}}! How was your visit at {{2}}? Reply 1-5 to rate your experience." },
  { name: "review_request", category: "Marketing", status: "approved", body: "Thanks {{1}}! Your feedback means a lot 🙏 Mind leaving us a Google review? {{2}}" },
  { name: "winback_30d", category: "Marketing", status: "approved", body: "Hey {{1}}, we miss you at {{2}}! It's been a while — come back this week for {{3}}." },
  { name: "loyalty_earned", category: "Utility", status: "approved", body: "You earned {{1}} points at {{2}}! You now have {{3}} total. 🎉" },
  { name: "referral_nudge", category: "Marketing", status: "pending", body: "Hi {{1}}! Love {{2}}? Refer a friend and you both get {{3}} off your next visit." },
]

const statusColor = { approved: "green", pending: "amber", rejected: "red" } as const

export default function WATemplates() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-text-primary">WhatsApp templates</h1>
        <Button variant="primary" size="sm">+ New template</Button>
      </div>

      <div className="space-y-4">
        {templates.map((t) => (
          <Card key={t.name} glass>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-growth-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4 text-growth-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-mono text-sm text-text-primary">{t.name}</p>
                    <Badge color={t.category === "Utility" ? "blue" : "teal"} variant="subtle">{t.category}</Badge>
                    <Badge color={statusColor[t.status as keyof typeof statusColor]} variant="subtle">{t.status}</Badge>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{t.body}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="sm" className="text-text-tertiary hover:text-text-primary">
                  <Edit size={13} />
                </Button>
                <Button variant="outline" size="sm" className="border-white/10 text-xs">
                  <Send size={12} /> Push all
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
