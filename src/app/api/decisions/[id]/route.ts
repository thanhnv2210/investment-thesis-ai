import { z } from "zod"
import { updateOutcomeNote } from "@/services/decision.service"

const inputSchema = z.object({
  outcomeNote: z.string().min(1),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params
  const decisionId = parseInt(id, 10)
  if (isNaN(decisionId)) {
    return new Response(JSON.stringify({ error: "Invalid id" }), { status: 400 })
  }

  const body = await req.json().catch(() => null)
  const parsed = inputSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 })
  }

  await updateOutcomeNote(decisionId, parsed.data.outcomeNote)
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
