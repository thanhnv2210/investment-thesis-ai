import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { createReview, updateCritiqueRaw, saveCounterarguments } from "@/services/review.service"

const client = new Anthropic()

const inputSchema = z.object({
  ticker: z.string().min(1).max(20),
  thesis: z.string().min(1),
  sourceMaterial: z.string().optional(),
})

const SYSTEM_PROMPT = `You are a sceptical investment analyst reviewing a retail investor's thesis.
Argue against the thesis — identify weak assumptions, underweighted risks, and contradictions in their source material.
Number each counterargument (1. 2. 3. ...).
Do not be balanced. Do not validate the thesis. Be adversarial.
End with a line: "COUNTERARGUMENTS_END"`

function parseCounterarguments(text: string): string[] {
  // Strip everything after COUNTERARGUMENTS_END
  const content = text.split("COUNTERARGUMENTS_END")[0]

  // Split on numbered list markers — e.g. "\n1. " "\n12. "
  const parts = content.split(/\n(?=\d+\. )/)

  return parts
    .map((p) => p.replace(/^\d+\.\s*/, "").trim())
    .filter((p) => p.length > 0)
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json().catch(() => null)
  const parsed = inputSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 })
  }

  const { ticker, thesis, sourceMaterial } = parsed.data

  const userMessage = [
    `Stock ticker: ${ticker}`,
    `\nInvestment thesis:\n${thesis}`,
    sourceMaterial ? `\nSource material:\n${sourceMaterial}` : "",
  ]
    .filter(Boolean)
    .join("")

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // Create a placeholder review row first so we have an ID
        const reviewId = await createReview(ticker, thesis, sourceMaterial)

        let fullText = ""

        const anthropicStream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        })

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const token = event.delta.text
            fullText += token
            send({ type: "token", token })
          }
        }

        // Save full critique and parsed counterarguments
        await updateCritiqueRaw(reviewId, fullText)
        const bodies = parseCounterarguments(fullText)
        await saveCounterarguments(reviewId, bodies)

        send({ type: "done", reviewId })
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : "Unknown error" })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
