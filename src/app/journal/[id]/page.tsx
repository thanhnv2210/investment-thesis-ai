import { notFound } from "next/navigation"
import Link from "next/link"
import { getReviewWithCounterarguments } from "@/services/review.service"
import { CounterargumentCard } from "@/components/thesis/counterargument-card"
import { DecisionForm } from "@/components/journal/decision-form"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MarkdownContent } from "@/components/markdown-content"

const ACTION_LABELS: Record<string, string> = {
  invest: "Invest",
  pass: "Pass",
  wait: "Wait",
  reduce: "Reduce",
}

const ACTION_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  invest: "default",
  pass: "destructive",
  wait: "secondary",
  reduce: "outline",
}

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const reviewId = parseInt(id, 10)
  if (isNaN(reviewId)) notFound()

  const review = await getReviewWithCounterarguments(reviewId)
  if (!review) notFound()

  const decision = review.decision ?? null
  const classified = review.counterarguments.filter((c) => c.classification !== null).length
  const total = review.counterarguments.length

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-primary font-mono font-bold text-xl">{review.ticker}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          {decision && (
            <Badge variant={ACTION_VARIANT[decision.action] ?? "secondary"}>
              {ACTION_LABELS[decision.action] ?? decision.action}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{review.thesis}</p>
      </div>

      <Separator />

      {/* Full AI critique */}
      {review.critiqueRaw && (
        <>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Full AI Critique</h2>
            <div className="rounded-lg border border-border bg-card p-5 text-sm text-foreground leading-relaxed max-h-[60vh] overflow-y-auto">
              <MarkdownContent>{review.critiqueRaw}</MarkdownContent>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Counterarguments */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">
          Counterarguments{" "}
          <span className="text-muted-foreground font-normal">
            ({classified}/{total} classified)
          </span>
        </h2>

        {total === 0 ? (
          <p className="text-sm text-muted-foreground">No counterarguments were parsed.</p>
        ) : (
          <div className="space-y-3">
            {review.counterarguments.map((c, i) => (
              <CounterargumentCard
                key={c.id}
                id={c.id}
                index={i + 1}
                body={c.body}
                initialClassification={
                  c.classification as "knew" | "manageable" | "changes_view" | null
                }
              />
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Decision section */}
      <div className="space-y-4">
        {decision ? (
          <>
            <h2 className="text-sm font-semibold text-foreground">Your Decision</h2>
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant={ACTION_VARIANT[decision.action] ?? "secondary"}>
                  {ACTION_LABELS[decision.action] ?? decision.action}
                </Badge>
                {decision.positionSize && (
                  <span className="text-xs text-muted-foreground">{decision.positionSize}</span>
                )}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{decision.rationale}</p>
              {decision.outcomeNote && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Outcome note</p>
                  <p className="text-sm text-foreground">{decision.outcomeNote}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-foreground">Record Your Decision</h2>
            <p className="text-sm text-muted-foreground">
              Having reviewed the counterarguments, what are you going to do?
            </p>
            <DecisionForm reviewId={reviewId} />
          </>
        )}
      </div>

      <Separator />
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back to journal
      </Link>
    </div>
  )
}
