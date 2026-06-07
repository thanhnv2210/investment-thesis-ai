import { z } from "zod"
import { saveDecision } from "@/services/decision.service"

const inputSchema = z.object({
  reviewId: z.number().int().positive(),
  action: z.enum(["invest", "pass", "wait", "reduce"]),
  rationale: z.string().min(1),
  positionSize: z.string().optional(),
})

export async function POST(req: Request): Promise<Response> {
  const body = await req.json().catch(() => null)
  const parsed = inputSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 })
  }

  const { reviewId, action, rationale, positionSize } = parsed.data
  const decisionId = await saveDecision(reviewId, { action, rationale, positionSize })
  return new Response(JSON.stringify({ id: decisionId }), { status: 201 })
}
