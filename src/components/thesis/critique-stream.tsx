"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface CritiqueStreamProps {
  text: string
  isStreaming: boolean
  ticker: string
}

export function CritiqueStream({ text, isStreaming, ticker }: CritiqueStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [text])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">
          AI Critique — <span className="text-primary">{ticker}</span>
        </span>
        {isStreaming && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-primary" />
            </span>
            Analysing…
          </span>
        )}
      </div>

      <div
        className={cn(
          "rounded-lg border border-border bg-card p-5 text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono min-h-40 max-h-[60vh] overflow-y-auto",
          isStreaming && "border-primary/30",
        )}
      >
        {text || <span className="text-muted-foreground">Waiting for response…</span>}
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
