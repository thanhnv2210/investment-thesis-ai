"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ThesisForm, type ThesisFormData } from "@/components/thesis/thesis-form"
import { CritiqueStream } from "@/components/thesis/critique-stream"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type CompletedTurn = {
  /** Exact message sent to Claude (used to rebuild conversation history) */
  claudeMessage: string
  /** Text shown in the UI for the user bubble */
  displayMessage: string
  aiResponse: string
  reviewId: number
}

type Phase = "idle" | "streaming" | "done" | "error"

type ApiPayload = {
  ticker: string
  thesis: string
  sourceMaterial?: string
  message?: string
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>
}

export default function NewReviewPage() {
  return (
    <Suspense>
      <NewReviewContent />
    </Suspense>
  )
}

function NewReviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTicker = searchParams.get("ticker") ?? undefined
  const initialThesis = searchParams.get("thesis") ?? undefined
  const [phase, setPhase] = useState<Phase>("idle")
  const [ticker, setTicker] = useState("")
  const [completedTurns, setCompletedTurns] = useState<CompletedTurn[]>([])
  const [currentDisplay, setCurrentDisplay] = useState("")
  const [streamingText, setStreamingText] = useState("")
  const [latestReviewId, setLatestReviewId] = useState<number | null>(null)
  const [followUp, setFollowUp] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (phase === "done") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [phase])

  async function runStream(displayMessage: string, claudeMessage: string, payload: ApiPayload) {
    setCurrentDisplay(displayMessage)
    setStreamingText("")
    setPhase("streaming")

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let fullText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const json = line.slice(6).trim()
          if (!json) continue

          const event = JSON.parse(json)
          if (event.type === "token") {
            fullText += event.token
            setStreamingText(fullText)
          } else if (event.type === "done") {
            setLatestReviewId(event.reviewId)
            setCompletedTurns((prev) => [
              ...prev,
              { claudeMessage, displayMessage, aiResponse: fullText, reviewId: event.reviewId },
            ])
            setStreamingText("")
            setCurrentDisplay("")
            setPhase("done")
          } else if (event.type === "error") {
            throw new Error(event.message)
          }
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong")
      setPhase("error")
    }
  }

  function handleFirstSubmit(data: ThesisFormData) {
    setTicker(data.ticker)
    const claudeMessage = [
      `Stock ticker: ${data.ticker}`,
      `\nInvestment thesis:\n${data.thesis}`,
      data.sourceMaterial ? `\nSource material:\n${data.sourceMaterial}` : "",
    ]
      .filter(Boolean)
      .join("")

    runStream(claudeMessage, claudeMessage, {
      ticker: data.ticker,
      thesis: data.thesis,
      sourceMaterial: data.sourceMaterial,
      message: claudeMessage,
    })
  }

  function handleFollowUp(e: React.FormEvent) {
    e.preventDefault()
    const text = followUp.trim()
    if (!text) return
    setFollowUp("")

    const history = completedTurns.flatMap((t) => [
      { role: "user" as const, content: t.claudeMessage },
      { role: "assistant" as const, content: t.aiResponse },
    ])

    // For follow-ups, send the raw text directly to Claude (history has the context)
    // Store it as the thesis in the DB too
    runStream(text, text, {
      ticker,
      thesis: text,
      message: text,
      conversationHistory: history,
    })
  }

  const hasConversation = completedTurns.length > 0 || phase === "streaming"

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-foreground">New Thesis Review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Write your investment case and let AI argue against it.
        </p>
      </div>

      {/* Initial form — only shown before any submission */}
      {phase === "idle" && !hasConversation && (
        <ThesisForm
          onSubmit={handleFirstSubmit}
          initialValues={{ ticker: initialTicker, thesis: initialThesis }}
        />
      )}

      {/* Conversation thread */}
      {hasConversation && (
        <div className="space-y-6">
          {completedTurns.map((turn, i) => (
            <div key={i} className="space-y-3">
              {/* User bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-foreground whitespace-pre-wrap">
                  {turn.displayMessage}
                </div>
              </div>
              {/* AI response */}
              <div className="flex items-center gap-2 mb-1.5 text-sm font-medium text-foreground">
                <span>AI Critique</span>
                <span className="text-primary">— {ticker}</span>
                {completedTurns.length > 1 && (
                  <span className="text-xs text-muted-foreground ml-auto">Turn {i + 1}</span>
                )}
              </div>
              <CritiqueStream text={turn.aiResponse} isStreaming={false} />
            </div>
          ))}

          {/* Streaming turn */}
          {phase === "streaming" && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-foreground whitespace-pre-wrap">
                  {currentDisplay}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1.5 text-sm font-medium text-foreground">
                <span>AI Critique</span>
                <span className="text-primary">— {ticker}</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full size-2 bg-primary" />
                  </span>
                  Analysing…
                </span>
              </div>
              <CritiqueStream text={streamingText} isStreaming={true} />
            </div>
          )}

          {/* Done: actions + follow-up input */}
          {phase === "done" && latestReviewId !== null && (
            <div className="space-y-4 pt-2" ref={bottomRef}>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={() => router.push(`/journal/${latestReviewId}`)}>
                  Review Counterarguments →
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPhase("idle")
                    setCompletedTurns([])
                    setTicker("")
                    setLatestReviewId(null)
                  }}
                >
                  Start New Review
                </Button>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Continue the conversation
                </p>
                <form onSubmit={handleFollowUp} className="space-y-3">
                  <Textarea
                    placeholder="Add more context, refine your thesis, or respond to the critique…"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    rows={4}
                  />
                  <Button type="submit" disabled={!followUp.trim()} variant="outline">
                    Send Follow-Up
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Error during conversation */}
          {phase === "error" && (
            <div className="space-y-4">
              <p className="text-sm text-destructive">Error: {errorMsg}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setPhase(completedTurns.length > 0 ? "done" : "idle")
                  setErrorMsg("")
                }}
              >
                {completedTurns.length > 0 ? "Back to Conversation" : "Try Again"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Error on very first submission (before any turn completes) */}
      {phase === "error" && !hasConversation && (
        <div className="space-y-4">
          <p className="text-sm text-destructive">Error: {errorMsg}</p>
          <Button variant="outline" onClick={() => { setPhase("idle"); setErrorMsg("") }}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
