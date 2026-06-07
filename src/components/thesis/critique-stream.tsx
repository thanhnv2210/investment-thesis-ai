"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { MarkdownContent } from "@/components/markdown-content"

interface CritiqueStreamProps {
  text: string
  isStreaming: boolean
}

export function CritiqueStream({ text, isStreaming }: CritiqueStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [text])

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-5 text-sm text-foreground leading-relaxed min-h-20 max-h-[70vh] overflow-y-auto",
        isStreaming && "border-primary/30",
      )}
    >
      {text ? (
        <MarkdownContent>{text}</MarkdownContent>
      ) : (
        <span className="text-muted-foreground">Waiting for response…</span>
      )}
      {isStreaming && (
        <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />
      )}
      <div ref={bottomRef} />
    </div>
  )
}
