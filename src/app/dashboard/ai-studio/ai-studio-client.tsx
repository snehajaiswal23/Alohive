"use client"
import { useState, useCallback, useEffect } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { DashCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles, Send, Copy, Check, MessageCircle, ImageIcon,
  MessageSquare, ChevronDown, AlertCircle, Rocket, Users,
  Info,
} from "lucide-react"
import {
  FESTIVAL_TEMPLATES,
  TEMPLATE_CATEGORY_LABELS,
  type FestivalTemplate,
  type TemplateCategory,
} from "@/lib/festival-templates"
import type { Tone, Language, GeneratedContent } from "@/lib/ai-generate"
import type { AudienceFilter } from "@/app/api/business/[id]/ai/campaign/route"

// ── Types ─────────────────────────────────────────────────────────────────────

type Channel = "whatsapp" | "instagram" | "sms"

interface LaunchResult {
  campaignId: string
  sentCount: number
  failedCount: number
  skippedCount: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TONES: Array<{ value: Tone; label: string }> = [
  { value: "professional", label: "Professional" },
  { value: "casual",       label: "Casual" },
  { value: "festive",      label: "Festive 🎉" },
]

const LANGUAGES: Array<{ value: Language; label: string }> = [
  { value: "english",   label: "English" },
  { value: "hindi",     label: "Hindi" },
  { value: "hinglish",  label: "Hinglish" },
]

const AUDIENCE_FILTERS: Array<{ value: AudienceFilter; label: string; description: string }> = [
  { value: "all",           label: "All customers",         description: "Everyone in your database" },
  { value: "top_tier",      label: "Gold & Platinum",       description: "Your highest-loyalty customers" },
  { value: "inactive_30d",  label: "Inactive 30+ days",     description: "Customers who haven't visited recently" },
  { value: "high_value",    label: "High value (5+ visits)", description: "Repeat customers with 5+ visits" },
  { value: "new_customers", label: "New this month",        description: "Joined in the last 30 days" },
]

const CHANNEL_ICONS = {
  whatsapp:  MessageCircle,
  instagram: ImageIcon,
  sms:       MessageSquare,
}

const CHANNEL_LABELS = {
  whatsapp:  "WhatsApp",
  instagram: "Instagram",
  sms:       "SMS",
}

const CATEGORY_ORDER: TemplateCategory[] = ["festival", "seasonal", "growth", "promotion"]

// ── Sub-components ────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-clarity-600 transition-colors"
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

function ContentPreview({ channel, text }: { channel: Channel; text: string }) {
  const charCount = text.length
  const isSmsSafe = charCount <= 160

  return (
    <div className="relative">
      {channel === "whatsapp" && (
        <div className="bg-[#e7fdd8] rounded-2xl rounded-tl-sm p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap border border-[#d4f5b8]">
          {text}
        </div>
      )}
      {channel === "instagram" && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
          {text}
        </div>
      )}
      {channel === "sms" && (
        <div>
          <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-200">
            {text}
          </div>
          <div className={`text-right text-xs mt-1 ${isSmsSafe ? "text-gray-400" : "text-red-500 font-medium"}`}>
            {charCount} / 160 chars {!isSmsSafe && "⚠ over limit"}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function AIStudioClient({ businessId }: { businessId: string }) {
  // Generator state
  const [prompt, setPrompt] = useState("")
  const [tone, setTone] = useState<Tone>("casual")
  const [language, setLanguage] = useState<Language>("english")
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState("")
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [activeChannel, setActiveChannel] = useState<Channel>("whatsapp")

  // Campaign launcher state
  const [campaignName, setCampaignName] = useState("")
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>("all")
  const [audienceCount, setAudienceCount] = useState<number | null>(null)
  const [audienceCapped, setAudienceCapped] = useState(false)
  const [showAudienceDrop, setShowAudienceDrop] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [launchError, setLaunchError] = useState("")
  const [launchResult, setLaunchResult] = useState<LaunchResult | null>(null)

  // Fetch audience count whenever filter or businessId changes
  const fetchCount = useCallback(async (filter: AudienceFilter) => {
    setAudienceCount(null)
    try {
      const res = await fetch(
        `/api/business/${businessId}/ai/campaign?filter=${filter}`,
      )
      const data = await res.json() as { count: number; capped: boolean }
      setAudienceCount(data.count)
      setAudienceCapped(data.capped)
    } catch {
      setAudienceCount(null)
    }
  }, [businessId])

  // Load count when content appears
  useEffect(() => {
    if (content) fetchCount(audienceFilter)
  }, [content, audienceFilter, fetchCount])

  async function handleGenerate() {
    if (!prompt.trim()) return
    setGenError("")
    setGenerating(true)
    setContent(null)
    setLaunchResult(null)
    try {
      const res = await fetch(`/api/business/${businessId}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), tone, language }),
      })
      const data = await res.json() as GeneratedContent & { error?: string }
      if (!res.ok) { setGenError(data.error || "Something went wrong"); return }
      setContent(data)
      setActiveChannel("whatsapp")
      if (!campaignName) {
        setCampaignName(`Campaign — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`)
      }
    } catch {
      setGenError("Network error. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  function handleTemplateClick(tpl: FestivalTemplate) {
    setPrompt(tpl.prompt)
    setTone(tpl.suggestTone)
    setContent(null)
    setLaunchResult(null)
    setGenError("")
  }

  async function handleLaunch() {
    if (!content || !campaignName.trim()) return
    setLaunchError("")
    setLaunching(true)
    setLaunchResult(null)
    try {
      const res = await fetch(`/api/business/${businessId}/ai/campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName.trim(),
          messageTemplate: content.whatsapp,
          audienceFilter,
        }),
      })
      const data = await res.json() as LaunchResult & { error?: string }
      if (!res.ok) { setLaunchError(data.error || "Launch failed"); return }
      setLaunchResult(data)
    } catch {
      setLaunchError("Network error. Please try again.")
    } finally {
      setLaunching(false)
    }
  }

  const templatesByCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    templates: FESTIVAL_TEMPLATES.filter((t) => t.category === cat),
  }))

  const selectedAudienceLabel =
    AUDIENCE_FILTERS.find((f) => f.value === audienceFilter)?.label ?? "All customers"

  return (
    <div>
      <Topbar
        title="AI Marketing Studio"
        subtitle="Generate ready-to-send campaign content with AI"
      />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Generator + Output ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Generator card */}
            <DashCard>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-clarity-500" />
                <h2 className="text-sm font-semibold text-gray-800">Campaign generator</h2>
              </div>

              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Describe your promotion
              </label>
              <textarea
                className="w-full rounded-[8px] px-3 py-2.5 text-sm border border-gray-200 focus:border-clarity-500 focus:ring-1 focus:ring-clarity-500/20 outline-none resize-none h-24 mb-4"
                placeholder="e.g. 20% off all hair colour services this weekend only, for existing customers"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleGenerate() }}
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Tone</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {TONES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTone(t.value)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          tone === t.value
                            ? "border-clarity-400 bg-clarity-50 text-clarity-700 font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Language</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => setLanguage(l.value)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          language === l.value
                            ? "border-clarity-400 bg-clarity-50 text-clarity-700 font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {genError && (
                <div className="flex items-center gap-2 mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <AlertCircle size={12} />
                  {genError}
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="w-full"
              >
                <Sparkles size={14} />
                {generating ? "Generating…" : "Generate content"}
              </Button>
              <p className="text-center text-[10px] text-gray-300 mt-2">⌘ + Enter to generate</p>
            </DashCard>

            {/* Generated content */}
            {content && (
              <DashCard>
                {/* Channel tabs */}
                <div className="flex border-b border-gray-100 mb-4 -mx-5 px-5">
                  {(["whatsapp", "instagram", "sms"] as Channel[]).map((ch) => {
                    const Icon = CHANNEL_ICONS[ch]
                    return (
                      <button
                        key={ch}
                        onClick={() => setActiveChannel(ch)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all -mb-px ${
                          activeChannel === ch
                            ? "border-clarity-500 text-clarity-700"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <Icon size={12} />
                        {CHANNEL_LABELS[ch]}
                      </button>
                    )
                  })}
                </div>

                {/* Content preview */}
                <ContentPreview channel={activeChannel} text={content[activeChannel]} />

                <div className="flex items-center justify-between mt-3">
                  <CopyButton text={content[activeChannel]} />
                  {activeChannel === "whatsapp" && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Info size={10} />
                      {"{name}"} will be replaced with each customer's name
                    </span>
                  )}
                </div>
              </DashCard>
            )}

            {/* Campaign launcher */}
            {content && !launchResult && (
              <DashCard className="border-clarity-100 bg-clarity-50/20">
                <div className="flex items-center gap-2 mb-4">
                  <Rocket className="w-4 h-4 text-clarity-600" />
                  <h2 className="text-sm font-semibold text-gray-800">Launch WhatsApp campaign</h2>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Campaign name
                    </label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g. Diwali 2025 — WhatsApp blast"
                      className="w-full rounded-[8px] px-3 py-2 text-sm border border-gray-200 focus:border-clarity-500 focus:ring-1 focus:ring-clarity-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Audience
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setShowAudienceDrop((v) => !v)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-[8px] bg-white hover:border-gray-300 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Users size={13} className="text-gray-400" />
                          {selectedAudienceLabel}
                          {audienceCount !== null && (
                            <span className="text-xs text-gray-400">
                              ({audienceCapped ? "300+" : audienceCount} customers)
                            </span>
                          )}
                        </span>
                        <ChevronDown size={13} className="text-gray-400" />
                      </button>

                      {showAudienceDrop && (
                        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                          {AUDIENCE_FILTERS.map((f) => (
                            <button
                              key={f.value}
                              onClick={() => {
                                setAudienceFilter(f.value)
                                setShowAudienceDrop(false)
                                fetchCount(f.value)
                              }}
                              className={`w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                                audienceFilter === f.value ? "bg-clarity-50" : ""
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${audienceFilter === f.value ? "text-clarity-700" : "text-gray-700"}`}>
                                  {f.label}
                                </p>
                                <p className="text-xs text-gray-400">{f.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {launchError && (
                  <div className="flex items-center gap-2 mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <AlertCircle size={12} />
                    {launchError}
                  </div>
                )}

                <Button
                  variant="primary"
                  onClick={handleLaunch}
                  disabled={launching || !campaignName.trim() || audienceCount === 0}
                  className="w-full"
                >
                  <Send size={14} />
                  {launching
                    ? "Sending…"
                    : audienceCount !== null
                    ? `Send to ${audienceCapped ? "300+" : audienceCount} customer${audienceCount === 1 ? "" : "s"}`
                    : "Send campaign"}
                </Button>

                <p className="text-center text-[10px] text-amber-600 mt-2 flex items-center justify-center gap-1">
                  <AlertCircle size={10} />
                  Messages will be sent immediately via WhatsApp. This cannot be undone.
                </p>
              </DashCard>
            )}

            {/* Launch success */}
            {launchResult && (
              <DashCard className="border-green-200 bg-green-50/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Check size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Campaign launched!</p>
                    <p className="text-xs text-gray-500">Messages are being delivered</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Sent",    value: launchResult.sentCount,    color: "text-green-600" },
                    { label: "Failed",  value: launchResult.failedCount,  color: "text-red-500" },
                    { label: "Skipped", value: launchResult.skippedCount, color: "text-gray-400" },
                  ].map((s) => (
                    <div key={s.label} className="text-center bg-white rounded-xl border border-gray-100 py-3">
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-200 text-gray-600"
                  onClick={() => { setContent(null); setLaunchResult(null); setPrompt(""); setCampaignName("") }}
                >
                  Start a new campaign
                </Button>
              </DashCard>
            )}
          </div>

          {/* ── Right: Template library ───────────────────────────────────────── */}
          <div className="space-y-4">
            <DashCard className="p-0 overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">Template library</h2>
                <p className="text-xs text-gray-400 mt-0.5">Click to use as your prompt</p>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                {templatesByCategory.map(({ category, templates }) => (
                  <div key={category}>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                        {TEMPLATE_CATEGORY_LABELS[category]}
                      </p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {templates.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => handleTemplateClick(tpl)}
                          className={`w-full text-left px-4 py-3 hover:bg-clarity-50/40 transition-colors group ${
                            prompt === tpl.prompt ? "bg-clarity-50/60" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-base leading-none">{tpl.emoji}</span>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-clarity-700">
                              {tpl.name}
                            </span>
                            {prompt === tpl.prompt && (
                              <Badge color="teal" variant="subtle" className="ml-auto text-[9px] py-0">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2 pl-7">{tpl.prompt}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DashCard>
          </div>
        </div>
      </div>
    </div>
  )
}
