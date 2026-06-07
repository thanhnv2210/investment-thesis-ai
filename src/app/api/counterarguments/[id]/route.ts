import { z } from "zod"
import { classifyCounterargument } from "@/services/review.service"

const inputSchema = z.object({
  classification: z.enum(["knew", "manageable", "changes_view"]),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params
  const counterargumentId = parseInt(id, 10)
  if (isNaN(counterargumentId)) {
    return new Response(JSON.stringify({ error: "Invalid id" }), { status: 400 })
  }

  const body = await req.json().catch(() => null)
  const parsed = inputSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 })
  }

  await classifyCounterargument(counterargumentId, parsed.data.classification)
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
