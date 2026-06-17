"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DashCard } from "@/components/ui/card"

interface WhatsappConfigState {
  appName: string | null
  isConnected: boolean
  lastError: string | null
  apiKeyMasked: string
}

interface TemplateRow {
  id: string
  name: string
  category: string
  body: string
  status: string
  gupshupTemplateId: string | null
}

interface WhatsappManagementProps {
  businessId: string
  initialConfig: WhatsappConfigState | null
  initialTemplates: TemplateRow[]
}

const SUGGESTED_TEMPLATE = {
  name: "post_visit_feedback",
  category: "Utility",
  body: "Hi {{1}}! Thanks for visiting {{2}} today. How was your experience? Reply with a rating from 1-5 ⭐",
}

const statusColor: Record<string, "gray" | "amber" | "green" | "red"> = {
  draft: "gray",
  submitted: "amber",
  approved: "green",
  rejected: "red",
}

export function WhatsappManagement({ businessId, initialConfig, initialTemplates }: WhatsappManagementProps) {
  const [config, setConfig] = useState(initialConfig)
  const [apiKey, setApiKey] = useState("")
  const [appName, setAppName] = useState(initialConfig?.appName || "")
  const [savingConfig, setSavingConfig] = useState(false)
  const [configError, setConfigError] = useState("")

  const [templates, setTemplates] = useState(initialTemplates)
  const [showAddTemplate, setShowAddTemplate] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templateCategory, setTemplateCategory] = useState("Utility")
  const [templateBody, setTemplateBody] = useState("")
  const [templateError, setTemplateError] = useState("")
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault()
    setSavingConfig(true)
    setConfigError("")
    try {
      const res = await fetch(`/api/business/${businessId}/whatsapp/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, appName: appName || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setConfigError(data.error || "Something went wrong")
        return
      }
      setConfig(data.config)
      setApiKey("")
      if (!data.config.isConnected) {
        setConfigError(data.config.lastError || "Could not verify this API key with Gupshup")
      }
    } catch {
      setConfigError("Network error. Please try again.")
    } finally {
      setSavingConfig(false)
    }
  }

  async function handleAddTemplate(e: React.FormEvent) {
    e.preventDefault()
    setSavingTemplate(true)
    setTemplateError("")
    try {
      const res = await fetch(`/api/business/${businessId}/whatsapp/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: templateName, category: templateCategory, body: templateBody }),
      })
      const data = await res.json()
      if (!res.ok) {
        setTemplateError(data.error || "Something went wrong")
        return
      }
      setTemplates((prev) => [...prev, data.template])
      setShowAddTemplate(false)
      setTemplateName("")
      setTemplateCategory("Utility")
      setTemplateBody("")
    } catch {
      setTemplateError("Network error. Please try again.")
    } finally {
      setSavingTemplate(false)
    }
  }

  function useSuggested() {
    setTemplateName(SUGGESTED_TEMPLATE.name)
    setTemplateCategory(SUGGESTED_TEMPLATE.category)
    setTemplateBody(SUGGESTED_TEMPLATE.body)
    setShowAddTemplate(true)
  }

  async function updateTemplateStatus(t: TemplateRow, status: string) {
    setBusyId(t.id)
    try {
      const res = await fetch(`/api/business/${businessId}/whatsapp/templates/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) return
      const data = await res.json()
      setTemplates((prev) => prev.map((row) => (row.id === t.id ? data.template : row)))
    } finally {
      setBusyId(null)
    }
  }

  async function saveGupshupId(t: TemplateRow, gupshupTemplateId: string) {
    setBusyId(t.id)
    try {
      const res = await fetch(`/api/business/${businessId}/whatsapp/templates/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gupshupTemplateId }),
      })
      if (!res.ok) return
      const data = await res.json()
      setTemplates((prev) => prev.map((row) => (row.id === t.id ? data.template : row)))
    } finally {
      setBusyId(null)
    }
  }

  async function handleRemoveTemplate(t: TemplateRow) {
    if (!confirm(`Remove template "${t.name}"?`)) return
    setBusyId(t.id)
    try {
      const res = await fetch(`/api/business/${businessId}/whatsapp/templates/${t.id}`, { method: "DELETE" })
      if (!res.ok) return
      setTemplates((prev) => prev.filter((row) => row.id !== t.id))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <DashCard>
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-sm font-semibold text-gray-800">WhatsApp setup (Gupshup)</h2>
          <Badge color={config?.isConnected ? "green" : "gray"} variant="subtle">
            {config?.isConnected ? "Connected" : "Not connected"}
          </Badge>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Paste the API key from your Gupshup dashboard. We verify it against your wallet balance before saving.
        </p>

        {config?.apiKeyMasked && (
          <p className="text-xs text-gray-500 mb-3">Current key: <span className="font-mono">{config.apiKeyMasked}</span></p>
        )}

        <form onSubmit={handleSaveConfig} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              theme="light"
              label="API key"
              type="password"
              placeholder={config ? "Enter a new key to update" : "Gupshup API key"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required={!config}
            />
            <Input
              theme="light"
              label="App name (optional)"
              placeholder="As shown in Gupshup dashboard"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
          </div>
          {configError && <p className="text-xs text-red-500">{configError}</p>}
          <Button type="submit" variant="primary" size="sm" disabled={savingConfig} className="self-start">
            {savingConfig ? "Verifying…" : "Save & test connection"}
          </Button>
        </form>
      </DashCard>

      <DashCard>
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-sm font-semibold text-gray-800">Message templates</h2>
          <div className="flex gap-2">
            {!templates.some((t) => t.name === SUGGESTED_TEMPLATE.name) && (
              <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg" onClick={useSuggested}>
                Use post-visit feedback template
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={() => setShowAddTemplate(true)}>+ Add template</Button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Create the template here, then submit the exact same name + body via your Gupshup dashboard for Meta review
          (usually 1–3 days). Once Meta approves it, mark it Approved below and paste the template ID Gupshup gives you —
          only approved templates with an ID will actually be sent after a visit.
        </p>

        {templates.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No templates yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {templates.map((t) => (
              <div key={t.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono font-medium text-gray-800">{t.name}</p>
                      <Badge color="blue" variant="subtle">{t.category}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t.body}</p>
                  </div>
                  <button
                    disabled={busyId === t.id}
                    onClick={() => handleRemoveTemplate(t)}
                    className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 shrink-0"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={t.status}
                    disabled={busyId === t.id}
                    onChange={(e) => updateTemplateStatus(t, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 disabled:opacity-50"
                  >
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted to Meta</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <Badge color={statusColor[t.status] || "gray"} variant="subtle">{t.status}</Badge>
                  <input
                    defaultValue={t.gupshupTemplateId || ""}
                    placeholder="Gupshup template ID once approved"
                    disabled={busyId === t.id}
                    onBlur={(e) => {
                      if (e.target.value !== (t.gupshupTemplateId || "")) saveGupshupId(t, e.target.value)
                    }}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 flex-1 min-w-[180px] font-mono disabled:opacity-50"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddTemplate && (
          <form onSubmit={handleAddTemplate} className="flex flex-col gap-2 pt-4 mt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2">
              <Input
                theme="light"
                placeholder="template_name (lowercase, underscores)"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                required
              />
              <select
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3"
              >
                <option value="Utility">Utility</option>
                <option value="Marketing">Marketing</option>
                <option value="Authentication">Authentication</option>
              </select>
            </div>
            <textarea
              placeholder="Body text with {{1}}, {{2}} placeholders"
              value={templateBody}
              onChange={(e) => setTemplateBody(e.target.value)}
              required
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-sm border border-gray-200 focus:border-trust-400 focus:ring-1 focus:ring-trust-400/20 outline-none transition-all"
            />
            {templateError && <p className="text-xs text-red-500">{templateError}</p>}
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="sm" disabled={savingTemplate}>
                {savingTemplate ? "Saving…" : "Save template"}
              </Button>
              <Button type="button" variant="outline" size="sm" className="border-gray-200 text-gray-700 rounded-lg" onClick={() => setShowAddTemplate(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DashCard>
    </>
  )
}
