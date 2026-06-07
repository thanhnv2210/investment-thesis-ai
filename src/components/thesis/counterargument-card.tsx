"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

type Classification = "knew" | "manageable" | "changes_view"

interface CounterargumentCardProps {
  id: number
  index: number
  body: string
  initialClassification: Classification | null
}

const CLASSIFY_OPTIONS: { value: Classification; label: string; description: string }[] = [
  { value: "knew", label: "Knew this", description: "Already in my model" },
  { value: "manageable", label: "Manageable", description: "Risk I can live with" },
  { value: "changes_view", label: "Changes my view", description: "Genuine blind spot" },
]

export function CounterargumentCard({
  id,
  index,
  body,
  initialClassification,
}: CounterargumentCardProps) {
  const [classification, setClassification] = useState<Classification | null>(initialClassification)
  const [saving, setSaving] = useState(false)

  async function handleClassify(value: Classification) {
    if (saving) return
    setSaving(true)
    const optimistic = classification
    setClassification(value)
    try {
      await fetch(`/api/counterarguments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classification: value }),
      })
    } catch {
      setClassification(optimistic)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-5 space-y-4 transition-colors",
        classification === "changes_view" && "border-destructive/40",
        classification === "manageable" && "border-primary/40",
        classification === "knew" && "border-border/60",
      )}
    >
      <p className="text-sm text-foreground leading-relaxed">
        <span className="text-muted-foreground font-mono text-xs mr-2">{index}.</span>
        {body}
      </p>

      <div className="flex flex-wrap gap-2">
        {CLASSIFY_OPTIONS.map((opt) => {
          const isSelected = classification === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => handleClassify(opt.value)}
              disabled={saving}
              title={opt.description}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
                isSelected && opt.value === "knew" &&
                  "bg-secondary border-secondary-foreground/20 text-secondary-foreground",
                isSelected && opt.value === "manageable" &&
                  "bg-primary/15 border-primary/40 text-primary",
                isSelected && opt.value === "changes_view" &&
                  "bg-destructive/15 border-destructive/40 text-destructive",
                !isSelected &&
                  "border-border text-muted-foreground hover:text-foreground hover:border-border/80",
                saving && "opacity-50 cursor-not-allowed",
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
