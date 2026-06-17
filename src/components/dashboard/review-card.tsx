"use client"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashCard } from "@/components/ui/card"
import { relativeTime } from "@/lib/utils"
import { Sparkles, Check, Send, Loader2, AlertCircle } from "lucide-react"

interface ReviewCardProps {
  id: string
  businessId: string
  reviewerName: string
  rating: number
  reviewText: string | null
  replyText: string | null
  aiSuggestedReply: string | null
  googleReviewId: string | null
  googleConnected: boolean
  publishedAt: Date | string | null
  createdAt: Date | string
}

export function ReviewCard({
  id,
  businessId,
  reviewerName,
  rating,
  reviewText,
  replyText: initialReplyText,
  aiSuggestedReply: initialSuggestion,
  googleReviewId,
  googleConnected,
  publishedAt,
  createdAt,
}: ReviewCardProps) {
  const [showPanel, setShowPanel] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(initialSuggestion)
  const [editedReply, setEditedReply] = useState<string>(initialSuggestion ?? "")
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)
  const [posting, setPosting] = useState(false)
  const [replyText, setReplyText] = useState<string | null>(initialReplyText)
  const [postResult, setPostResult] = useState<{ postedToGoogle: boolean; error?: string } | null>(null)
  const [suggestionError, setSuggestionError] = useState<string | null>(null)

  const isNegativeUnreplied = rating <= 2 && !replyText

  async function handleSuggest() {
    setShowPanel(true)
    if (suggestion) return
    setLoadingSuggestion(true)
    setSuggestionError(null)
    try {
      const res = await fetch(`/api/business/${businessId}/reviews/${id}/ai-reply`)
      const json = await res.json() as { suggestion?: string; error?: string }
      if (!res.ok || json.error) {
        setSuggestionError(json.error ?? "Failed to generate suggestion")
      } else if (json.suggestion) {
        setSuggestion(json.suggestion)
        setEditedReply(json.suggestion)
      }
    } catch {
      setSuggestionError("Network error — please try again")
    } finally {
      setLoadingSuggestion(false)
    }
  }

  async function handlePost() {
    const text = editedReply.trim()
    if (!text) return
    setPosting(true)
    setPostResult(null)
    try {
      const res = await fetch(`/api/business/${businessId}/reviews/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText: text }),
      })
      const json = await res.json() as { ok?: boolean; postedToGoogle?: boolean; googleError?: string; error?: string }
      if (!res.ok || json.error) {
        setPostResult({ postedToGoogle: false, error: json.error ?? "Failed to save reply" })
      } else {
        setReplyText(text)
        setShowPanel(false)
        setPostResult({ postedToGoogle: json.postedToGoogle ?? false })
      }
    } catch {
      setPostResult({ postedToGoogle: false, error: "Network error — please try again" })
    } finally {
      setPosting(false)
    }
  }

  return (
    <DashCard className={isNegativeUnreplied ? "border-red-200 bg-red-50/30" : ""}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
            {reviewerName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-gray-800 text-sm">{reviewerName}</span>
              {isNegativeUnreplied && <Badge color="red" variant="subtle">Needs reply</Badge>}
              {replyText && <Badge color="green" variant="subtle">Replied</Badge>}
              {!isNegativeUnreplied && !replyText && googleReviewId && (
                <Badge color="blue" variant="subtle">Google</Badge>
              )}
            </div>
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={`text-sm ${s <= rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
              ))}
            </div>
            {reviewText && <p className="text-sm text-gray-600 leading-relaxed">{reviewText}</p>}
            {replyText && (
              <div className="mt-2 pl-3 border-l-2 border-gray-200">
                <p className="text-xs text-gray-500 font-medium mb-0.5">Owner reply</p>
                <p className="text-xs text-gray-500">{replyText}</p>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1.5">{relativeTime(publishedAt ?? createdAt)}</p>

            {showPanel && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-500" />
                  <span className="text-xs font-medium text-amber-700">AI reply suggestion</span>
                  {!initialSuggestion && (
                    <span className="text-xs text-amber-400 ml-1">· edit before sending</span>
                  )}
                </div>

                {loadingSuggestion && (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 size={12} className="animate-spin text-amber-500" />
                    <span className="text-xs text-amber-600">Generating reply…</span>
                  </div>
                )}

                {suggestionError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle size={12} />
                    {suggestionError}
                  </div>
                )}

                {!loadingSuggestion && !suggestionError && (
                  <textarea
                    className="w-full text-xs text-gray-700 bg-white border border-amber-200 rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
                    rows={4}
                    value={editedReply}
                    onChange={(e) => setEditedReply(e.target.value)}
                    placeholder="Edit the reply above before posting…"
                  />
                )}

                {postResult?.error && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle size={12} />
                    {postResult.error}
                  </div>
                )}

                {!loadingSuggestion && !suggestionError && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                      onClick={handlePost}
                      disabled={posting || !editedReply.trim()}
                    >
                      {posting ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : googleConnected && googleReviewId ? (
                        <Send size={12} />
                      ) : (
                        <Check size={12} />
                      )}
                      {posting
                        ? "Posting…"
                        : googleConnected && googleReviewId
                          ? "Post to Google"
                          : "Save reply"}
                    </Button>
                    <button
                      className="text-xs text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPanel(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {postResult && !postResult.error && (
              <div className={`mt-2 flex items-center gap-1.5 text-xs ${postResult.postedToGoogle ? "text-green-600" : "text-gray-500"}`}>
                <Check size={12} />
                {postResult.postedToGoogle
                  ? "Reply posted to Google"
                  : "Reply saved locally (Google not connected)"}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {!replyText && (
            <Button
              variant="outline"
              size="sm"
              className="border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg text-xs px-3 py-1.5 flex items-center gap-1.5"
              onClick={() => (showPanel ? setShowPanel(false) : handleSuggest())}
            >
              <Sparkles size={12} />
              {showPanel ? "Hide" : "Suggest reply"}
            </Button>
          )}
        </div>
      </div>
    </DashCard>
  )
}
