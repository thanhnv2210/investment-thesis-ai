"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export interface ThesisFormData {
  ticker: string
  thesis: string
  sourceMaterial?: string
}

interface ThesisFormProps {
  onSubmit: (data: ThesisFormData) => void
  isLoading?: boolean
}

export function ThesisForm({ onSubmit, isLoading = false }: ThesisFormProps) {
  const [ticker, setTicker] = useState("")
  const [thesis, setThesis] = useState("")
  const [sourceMaterial, setSourceMaterial] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticker.trim() || !thesis.trim()) return
    onSubmit({
      ticker: ticker.trim().toUpperCase(),
      thesis: thesis.trim(),
      sourceMaterial: sourceMaterial.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="ticker">Ticker</Label>
        <Input
          id="ticker"
          placeholder="e.g. NVDA"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="w-40 uppercase"
          maxLength={20}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="thesis">Your Investment Thesis</Label>
        <p className="text-xs text-muted-foreground">
          Write your bull case. Why do you think this is a good investment?
        </p>
        <Textarea
          id="thesis"
          placeholder="I believe NVDA will continue to grow because..."
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
          rows={6}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="source">
          Source Material{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          Paste earnings transcripts, news, or analyst notes for Claude to challenge.
        </p>
        <Textarea
          id="source"
          placeholder="Paste earnings call excerpts, news articles, or other context..."
          value={sourceMaterial}
          onChange={(e) => setSourceMaterial(e.target.value)}
          rows={5}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading || !ticker.trim() || !thesis.trim()}>
        {isLoading ? "Analysing…" : "Stress-Test My Thesis"}
      </Button>
    </form>
  )
}
