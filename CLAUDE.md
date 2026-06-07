# CLAUDE.md — Investment Thesis AI

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Investment Thesis AI** — a tool for retail investors to stress-test investment decisions
using AI. The user writes a thesis for a stock; Claude argues against it adversarially,
surfacing blind spots before a decision is made. The user classifies each counterargument
and saves their final decision to a personal journal.

**Not a signal generator.** It does not predict prices or recommend trades. It helps the
user think more rigorously about decisions they have already chosen to investigate.

**Single-user, no auth.** Personal tool, runs locally. No login required.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + App Router + Turbopack |
| Styling | TailwindCSS v4 + shadcn/ui (New York style, zinc base, amber accent) |
| ORM | Drizzle ORM (`postgres` driver) |
| Database | PostgreSQL — **Neon** (hosted, ap-southeast-1), database `neondb`, schema `thesis_ai` |
| AI | Anthropic SDK (`anthropic` package) — Claude Sonnet 4.6, SSE streaming |
| Validation | Zod |
| Package manager | pnpm |
| Port | 3017 |

## Commands

```bash
pnpm dev          # dev server at http://localhost:3017
pnpm build        # production build
pnpm lint         # ESLint

pnpm db:generate  # generate migration after schema change
pnpm db:migrate   # apply pending migrations
pnpm db:studio    # Drizzle Studio at http://localhost:4983
```

## First-Time Setup (New Session)

Database is **Neon** (hosted) — no local Postgres required. `.env` already exists with credentials.

```bash
# 1. Install dependencies
cd /Users/ThanhNguyen/AI_WS/investment-thesis-ai
pnpm install

# 2. Apply any pending migrations (Neon DB is already provisioned)
pnpm db:migrate

# 3. Start dev server
pnpm dev
```

## Environment Variables

```
DATABASE_URL=postgresql://<neon-credentials>@ep-dry-cherry-aoh661hd.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
ANTHROPIC_API_KEY=sk-ant-...
```

Both variables are already set in `.env` — do not overwrite.

## Architecture

```
src/
  app/
    layout.tsx              # root layout — sidebar + main area
    globals.css             # TailwindCSS v4 + shadcn tokens (dark, amber accent)
    page.tsx                # / — journal home: list of past decisions
    new/
      page.tsx              # /new — thesis entry form + streaming critique flow
    journal/[id]/
      page.tsx              # /journal/[id] — saved decision detail
    api/
      review/
        route.ts            # POST /api/review — calls Claude, SSE stream, saves critique
      counterarguments/
        [id]/
          route.ts          # PATCH /api/counterarguments/[id] — classify a counterargument
      decisions/
        route.ts            # POST /api/decisions — save final decision
        [id]/
          route.ts          # PATCH /api/decisions/[id] — update outcome note later
  components/
    nav/
      sidebar.tsx           # fixed left sidebar — links to /, /new
    thesis/
      thesis-form.tsx       # ticker + thesis + source material form
      critique-stream.tsx   # live streaming display as Claude responds
      counterargument-card.tsx  # individual counterargument with classify buttons
    journal/
      journal-list.tsx      # list of past decisions on home page
      decision-form.tsx     # action + rationale form after classification
    ui/                     # shadcn/ui primitives — do not edit manually
  db/
    index.ts                # Drizzle client
    schema.ts               # thesis_ai schema — all 3 tables
  lib/
    utils.ts                # cn() utility
  services/
    review.service.ts       # save/load thesis reviews and counterarguments
    decision.service.ts     # save/load decisions
```

## Database Schema (thesis_ai)

Three tables:

**thesis_reviews** — one row per AI review session
- `id` serial PK
- `ticker` varchar(20) — the stock symbol
- `thesis` text — user's investment case in their own words
- `source_material` text nullable — optional pasted context (earnings, news)
- `critique_raw` text — full Claude response, saved after stream completes
- `created_at` timestamptz

**counterarguments** — extracted from Claude's critique
- `id` serial PK
- `review_id` integer → thesis_reviews
- `body` text — the counterargument text
- `classification` varchar(20) nullable — 'knew' | 'manageable' | 'changes_view'
- `sort_order` smallint — display order

**decisions** — one row per review (1:1 with thesis_reviews)
- `id` serial PK
- `review_id` integer → thesis_reviews (unique)
- `action` varchar(20) — 'invest' | 'pass' | 'wait' | 'reduce'
- `rationale` text — why this decision
- `position_size` varchar(50) nullable — optional free text
- `outcome_note` text nullable — filled in after the fact
- `decided_at` timestamptz

## AI Integration

**Endpoint:** `POST /api/review`

**Input (Zod validated):**
```ts
{ ticker: string, thesis: string, sourceMaterial?: string }
```

**Flow:**
1. Build prompt — ticker, thesis, optional source material
2. Call `anthropic.messages.stream(...)` with adversarial system prompt
3. Return SSE stream to client — client renders tokens as they arrive
4. After stream completes: parse numbered counterarguments from full response
5. Save `thesis_reviews` row + `counterarguments` rows to DB
6. Return `{ reviewId }` in final SSE event so client can redirect

**Adversarial system prompt:**
> You are a sceptical investment analyst reviewing a retail investor's thesis.
> Argue against the thesis — identify weak assumptions, underweighted risks, and
> contradictions in their source material. Number each counterargument (1. 2. 3. ...).
> Do not be balanced. Do not validate the thesis. Be adversarial.
> End with a line: "COUNTERARGUMENTS_END"

**Counterargument parsing:** Split response on `\n[0-9]+\. ` regex to extract individual
points. The `COUNTERARGUMENTS_END` marker signals end of parseable content.

## Key Rules

- **Service layer** for all DB logic — API routes call services only, no raw queries in
  `route.ts` files
- **Zod** for input validation at every API route boundary
- **Named exports** for all components and services — no default exports
- **`postgres` driver** (not `pg`)
- **`pgSchema('thesis_ai')`** namespaces all tables
- **Never edit `src/components/ui/`** — shadcn auto-generated components
- **Anthropic SDK directly** — not Vercel AI SDK. Use `anthropic.messages.stream()` for
  SSE, handle with `ReadableStream` in Next.js route handler
- **Dark theme only** — no light mode toggle needed for MVP

## Implementation Status

Track progress here. Update as each step is completed.

| Step | Description | Status |
|------|-------------|--------|
| 1 | Init scaffold — package.json, configs, globals.css | ✅ Done |
| 2 | DB schema — schema.ts + first migration | ✅ Done |
| 3 | API: POST /api/review — Claude SSE stream + save | ⬜ Next |
| 4 | UI: /new — thesis form + streaming critique display | ⬜ |
| 5 | UI: counterargument-card — classify buttons + PATCH endpoint | ⬜ |
| 6 | API + UI: POST /api/decisions + decision-form | ⬜ |
| 7 | UI: / journal-list — past decisions home page | ⬜ |
| 8 | UI: /journal/[id] — decision detail view | ⬜ |
| 9 | Polish — loading states, error handling, empty states | ⬜ |

**Next session start:** Run first-time setup above, then begin Step 3 (API /api/review).

## Shadcn/UI Components to Install

Install these as needed (do not pre-install all):
```bash
pnpm dlx shadcn@latest add button card input textarea badge separator tabs
```

## Proposal

Full product proposal is in the architecture-practice doc viewer:
`/Users/ThanhNguyen/AI_WS/architecture-practice/public/docs/investment-thesis-ai/proposal.md`

## Related Repositories

| Repo | Relation |
|------|---------|
| `stock-ai-dashboard` (port 3016) | Separate — signal viewer for stock-ai-agent pipeline. No integration with this app. |
| `architecture-practice` (port 3004) | Hosts proposal doc and is the central doc viewer |
