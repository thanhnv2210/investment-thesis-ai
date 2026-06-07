"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Action = "invest" | "pass" | "wait" | "reduce"

const ACTIONS: { value: Action; label: string; description: string }[] = [
  { value: "invest", label: "Invest", description: "Open or add to position" },
  { value: "pass", label: "Pass", description: "Skip this opportunity" },
  { value: "wait", label: "Wait", description: "Monitor before deciding" },
  { value: "reduce", label: "Reduce", description: "Trim existing position" },
]

interface DecisionFormProps {
  reviewId: number
}

export function DecisionForm({ reviewId }: DecisionFormProps) {
  const router = useRouter()
  const [action, setAction] = useState<Action | null>(null)
  const [rationale, setRationale] = useState("")
  const [positionSize, setPositionSize] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!action || !rationale.trim()) return
    setSaving(true)
    setError("")

    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          action,
          rationale: rationale.trim(),
          positionSize: positionSize.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error("Failed to save decision")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Decision</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ACTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAction(opt.value)}
              disabled={saving}
              className={cn(
                "flex flex-col items-start px-4 py-3 rounded-lg border text-left transition-all",
                action === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-border/80",
                saving && "opacity-50 cursor-not-allowed",
              )}
            >
              <span className="font-medium text-sm">{opt.label}</span>
              <span className="text-xs mt-0.5 opacity-70">{opt.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rationale">Rationale</Label>
        <p className="text-xs text-muted-foreground">
          Why are you making this decision given the counterarguments above?
        </p>
        <Textarea
          id="rationale"
          placeholder="Despite the risks raised, I'm proceeding because..."
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          rows={4}
          disabled={saving}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="position-size">
          Position Size{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="position-size"
          placeholder="e.g. 3% of portfolio, $2,000"
          value={positionSize}
          onChange={(e) => setPositionSize(e.target.value)}
          disabled={saving}
          className="max-w-xs"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={saving || !action || !rationale.trim()}
      >
        {saving ? "Saving…" : "Record Decision"}
      </Button>
    </form>
  )
}
