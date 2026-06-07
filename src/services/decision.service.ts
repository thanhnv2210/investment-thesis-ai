import { db } from "@/db"
import { decisions } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function saveDecision(
  reviewId: number,
  data: {
    action: "invest" | "pass" | "wait" | "reduce"
    rationale: string
    positionSize?: string
  },
): Promise<number> {
  const [row] = await db
    .insert(decisions)
    .values({ reviewId, ...data })
    .returning({ id: decisions.id })
  return row.id
}

export async function updateOutcomeNote(decisionId: number, outcomeNote: string): Promise<void> {
  await db
    .update(decisions)
    .set({ outcomeNote })
    .where(eq(decisions.id, decisionId))
}
