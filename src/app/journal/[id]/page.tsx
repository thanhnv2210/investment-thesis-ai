import { notFound } from "next/navigation"
import Link from "next/link"
import { getReviewWithCounterarguments } from "@/services/review.service"
import { CounterargumentCard } from "@/components/thesis/counterargument-card"
import { Separator } from "@/components/ui/separator"

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
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{review.thesis}</p>
      </div>

      <Separator />

      {/* Counterarguments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Counterarguments
            <span className="ml-2 text-muted-foreground font-normal">
              ({classified}/{total} classified)
            </span>
          </h2>
        </div>

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
                  (c.classification as "knew" | "manageable" | "changes_view" | null)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Step 6 placeholder: decision form will go here */}
      <Separator />
      <div className="text-sm text-muted-foreground">
        Decision form coming in next step.{" "}
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          Back to journal
        </Link>
      </div>
    </div>
  )
}
