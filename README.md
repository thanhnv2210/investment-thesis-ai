# Investment Thesis AI

A personal tool for stress-testing investment decisions with AI.

Write a thesis for a stock → Claude argues against it adversarially → you classify each
counterargument → save your decision to a personal journal.

**Not financial advice. Not a signal generator. A thinking tool.**

## Stack

- Next.js 16 + App Router
- TailwindCSS v4 + shadcn/ui (New York, zinc, amber accent)
- Drizzle ORM + PostgreSQL
- Anthropic SDK (Claude Sonnet 4.6)
- Port 3017

## Setup

```bash
pnpm install
cp .env.example .env   # fill in DATABASE_URL and ANTHROPIC_API_KEY

psql postgresql://ThanhNguyen@localhost:5432/postgres \
  -c "CREATE DATABASE investment_thesis_ai;"
psql postgresql://ThanhNguyen@localhost:5432/investment_thesis_ai \
  -c "CREATE SCHEMA IF NOT EXISTS thesis_ai;"

pnpm db:migrate
pnpm dev
```

Open [http://localhost:3017](http://localhost:3017)

## See Also

- Full proposal: `architecture-practice` doc viewer → AI Projects → Investment Thesis AI
- Related: `stock-ai-dashboard` (port 3016) — separate signal viewer, no integration
