import Link from "next/link"
import { listReviews } from "@/services/review.service"
import { Badge } from "@/components/ui/badge"
import { PlusCircle } from "lucide-react"

const ACTION_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  invest: "default",
  pass: "destructive",
  wait: "secondary",
  reduce: "outline",
}

const ACTION_LABELS: Record<string, string> = {
  invest: "Invest",
  pass: "Pass",
  wait: "Wait",
  reduce: "Reduce",
}

export async function JournalList() {
  const reviews = await listReviews()

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <p className="text-muted-foreground text-sm">No reviews yet.</p>
        <Link
          href="/new"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline underline-offset-4"
        >
          <PlusCircle className="size-4" />
          Start your first thesis review
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {reviews.map((review) => {
        const total = review.counterarguments.length
        const classified = review.counterarguments.filter((c) => c.classification !== null).length
        const decision = review.decision ?? null

        return (
          <Link
            key={review.id}
            href={`/journal/${review.id}`}
            className="flex items-start gap-4 px-8 py-5 hover:bg-muted/40 transition-colors group"
          >
            {/* Ticker */}
            <span className="text-primary font-mono font-bold text-base w-20 shrink-0 pt-0.5">
              {review.ticker}
            </span>

            {/* Body */}
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                {review.thesis}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {total > 0 && (
                  <span>{classified}/{total} classified</span>
                )}
              </div>
            </div>

            {/* Decision badge */}
            <div className="shrink-0 pt-0.5">
              {decision ? (
                <Badge variant={ACTION_VARIANT[decision.action] ?? "secondary"}>
                  {ACTION_LABELS[decision.action] ?? decision.action}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground border-dashed">
                  Pending
                </Badge>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
