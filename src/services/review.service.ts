import { db } from "@/db"
import { thesisReviews, counterarguments } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function createReview(
  ticker: string,
  thesis: string,
  sourceMaterial?: string,
): Promise<number> {
  const [row] = await db
    .insert(thesisReviews)
    .values({ ticker, thesis, sourceMaterial })
    .returning({ id: thesisReviews.id })
  return row.id
}

export async function updateCritiqueRaw(reviewId: number, critiqueRaw: string): Promise<void> {
  await db
    .update(thesisReviews)
    .set({ critiqueRaw })
    .where(eq(thesisReviews.id, reviewId))
}

export async function saveCounterarguments(reviewId: number, bodies: string[]): Promise<void> {
  if (bodies.length === 0) return
  await db.insert(counterarguments).values(
    bodies.map((body, i) => ({ reviewId, body, sortOrder: i })),
  )
}

export async function classifyCounterargument(
  id: number,
  classification: "knew" | "manageable" | "changes_view",
): Promise<void> {
  await db
    .update(counterarguments)
    .set({ classification })
    .where(eq(counterarguments.id, id))
}

export async function getReviewWithCounterarguments(reviewId: number) {
  const review = await db.query.thesisReviews.findFirst({
    where: eq(thesisReviews.id, reviewId),
    with: { counterarguments: { orderBy: (c, { asc }) => [asc(c.sortOrder)] } },
  })
  return review ?? null
}
