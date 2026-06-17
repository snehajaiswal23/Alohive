"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashCard } from "@/components/ui/card"
import { relativeTime } from "@/lib/utils"

interface GoogleOAuthConfigState {
  isConnected: boolean
  connectedAt: Date | null
  lastSyncedAt: Date | null
  lastError: string | null
}

interface GoogleConnectionCardProps {
  businessId: string
  config: GoogleOAuthConfigState | null
}

export function GoogleConnectionCard({ businessId, config }: GoogleConnectionCardProps) {
  const [disconnecting, setDisconnecting] = useState(false)
  const [current, setCurrent] = useState(config)

  async function handleDisconnect() {
    if (!confirm("Disconnect Google Business Profile? Review syncing will stop until you reconnect.")) return
    setDisconnecting(true)
    try {
      const res = await fetch(`/api/business/${businessId}/google/oauth`, { method: "DELETE" })
      if (res.ok) setCurrent(null)
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <DashCard>
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-sm font-semibold text-gray-800">Google Business Profile</h2>
        <Badge color={current?.isConnected ? "green" : "gray"} variant="subtle">
          {current?.isConnected ? "Connected" : "Not connected"}
        </Badge>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Connect your Google Business Profile to automatically sync new reviews every 6 hours.
      </p>

      {current?.isConnected && (
        <div className="text-xs text-gray-500 mb-3 space-y-0.5">
          {current.connectedAt && <p>Connected {relativeTime(current.connectedAt)}</p>}
          <p>Last synced: {current.lastSyncedAt ? relativeTime(current.lastSyncedAt) : "not yet synced"}</p>
        </div>
      )}

      {current?.lastError && (
        <p className="text-xs text-red-500 mb-3">{current.lastError}</p>
      )}

      {current?.isConnected ? (
        <Button
          variant="outline"
          size="sm"
          className="border-gray-200 text-gray-700 rounded-lg self-start"
          onClick={handleDisconnect}
          disabled={disconnecting}
        >
          {disconnecting ? "Disconnecting…" : "Disconnect"}
        </Button>
      ) : (
        <Button
          variant="primary"
          size="sm"
          className="self-start"
          onClick={() => { window.location.href = `/api/business/${businessId}/google/oauth/connect` }}
        >
          Connect Google Business Profile
        </Button>
      )}
    </DashCard>
  )
}
