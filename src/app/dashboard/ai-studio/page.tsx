"use client"
import { useState } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { DashCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Send, Copy, Download } from "lucide-react"

const templates = [
  { name: "Diwali offer", category: "Festival", preview: "Celebrate Diwali with 25% off all services..." },
  { name: "New service launch", category: "Promotion", preview: "Introducing our new Keratin treatment..." },
  { name: "Summer campaign", category: "Seasonal", preview: "Beat the heat with our summer hair care..." },
  { name: "Referral drive", category: "Growth", preview: "Bring a friend and both get 15% off..." },
]

export default function AIStudioPage() {
  const [prompt, setPrompt] = useState("")
  const [generated, setGenerated] = useState("")
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setGenerated(
      `WhatsApp:\nHi {name}! 🎉 ${prompt}\n\nReply YES to claim your offer or STOP to opt out.\n\n---\nInstagram caption:\n✨ ${prompt} ✨\n\nBook now via the link in bio. Limited slots available! #GlossStudio #Salon #Bangalore\n\n---\nSMS:\n${prompt} - Reply YES to book. T&C apply.`,
    )
    setLoading(false)
  }

  return (
    <div>
      <Topbar title="AI Marketing Studio" subtitle="Generate ready-to-send campaign content with AI" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generator */}
          <div className="lg:col-span-2 space-y-4">
            <DashCard>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-clarity-500" />
                <h2 className="text-sm font-semibold text-gray-800">Campaign generator</h2>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Describe your promotion</label>
                <textarea
                  className="w-full rounded-[8px] px-3 py-2.5 text-sm border border-gray-200 focus:border-clarity-500 focus:ring-1 focus:ring-clarity-500/20 outline-none resize-none h-20"
                  placeholder="e.g. 20% off all hair colour services this weekend only, for existing customers"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {["Salon", "Casual", "Hindi"].map((chip) => (
                  <button key={chip} className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-clarity-400 hover:text-clarity-700">
                    {chip}
                  </button>
                ))}
              </div>
              <Button variant="primary" onClick={handleGenerate} disabled={loading} className="w-full">
                <Sparkles size={14} /> {loading ? "Generating…" : "Generate content"}
              </Button>
            </DashCard>

            {generated && (
              <DashCard>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold text-gray-800">Generated content</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg text-xs">
                      <Copy size={12} /> Copy
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg text-xs">
                      <Download size={12} /> Export
                    </Button>
                  </div>
                </div>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 leading-relaxed font-sans">
                  {generated}
                </pre>
                <div className="flex gap-2 mt-4">
                  <Button variant="primary" size="sm">
                    <Send size={12} /> Launch campaign
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg">
                    Schedule for later
                  </Button>
                </div>
              </DashCard>
            )}
          </div>

          {/* Template library */}
          <div>
            <DashCard>
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Template library</h2>
              <div className="space-y-3">
                {templates.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setPrompt(t.preview)}
                    className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-clarity-200 hover:bg-clarity-50/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-700">{t.name}</span>
                      <Badge color="teal" variant="subtle">{t.category}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{t.preview}</p>
                  </button>
                ))}
              </div>
            </DashCard>
          </div>
        </div>
      </div>
    </div>
  )
}
