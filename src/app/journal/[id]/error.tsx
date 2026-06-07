"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function JournalDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 space-y-4">
      <p className="text-sm font-medium text-foreground">Failed to load this review.</p>
      <p className="text-xs text-muted-foreground">{error.message}</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="ghost">← Back to journal</Button>
        </Link>
      </div>
    </div>
  )
}
