"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ThesisForm, type ThesisFormData } from "@/components/thesis/thesis-form"
import { CritiqueStream } from "@/components/thesis/critique-stream"
import { Button } from "@/components/ui/button"

type Phase = "idle" | "streaming" | "done" | "error"

export default function NewReviewPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>("idle")
  const [streamText, setStreamText] = useState("")
  const [reviewId, setReviewId] = useState<number | null>(null)
  const [ticker, setTicker] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(data: ThesisFormData) {
    setTicker(data.ticker)
    setStreamText("")
    setPhase("streaming")

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

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
            setStreamText((prev) => prev + event.token)
          } else if (event.type === "done") {
            setReviewId(event.reviewId)
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

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-foreground">New Thesis Review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Write your investment case and let AI argue against it.
        </p>
      </div>

      {phase === "idle" && (
        <ThesisForm onSubmit={handleSubmit} />
      )}

      {(phase === "streaming" || phase === "done") && (
        <div className="space-y-6">
          <CritiqueStream
            text={streamText}
            isStreaming={phase === "streaming"}
            ticker={ticker}
          />

          {phase === "done" && reviewId !== null && (
            <div className="flex gap-3">
              <Button onClick={() => router.push(`/journal/${reviewId}`)}>
                Review Counterarguments →
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPhase("idle")
                  setStreamText("")
                  setReviewId(null)
                }}
              >
                Start New Review
              </Button>
            </div>
          )}
        </div>
      )}

      {phase === "error" && (
        <div className="space-y-4">
          <p className="text-sm text-destructive">Error: {errorMsg}</p>
          <Button
            variant="outline"
            onClick={() => {
              setPhase("idle")
              setErrorMsg("")
            }}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
