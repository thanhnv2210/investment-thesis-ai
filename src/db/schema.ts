import {
  pgSchema,
  serial,
  varchar,
  text,
  smallint,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const thesisAi = pgSchema("thesis_ai")

// One row per AI review session
export const thesisReviews = thesisAi.table("thesis_reviews", {
  id:             serial("id").primaryKey(),
  ticker:         varchar("ticker", { length: 20 }).notNull(),
  thesis:         text("thesis").notNull(),
  sourceMaterial: text("source_material"),
  critiqueRaw:    text("critique_raw").notNull().default(""),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const thesisReviewsRelations = relations(thesisReviews, ({ many, one }) => ({
  counterarguments: many(counterarguments),
  decision: one(decisions, { fields: [thesisReviews.id], references: [decisions.reviewId] }),
}))

// Individual counterarguments extracted from Claude's critique
export const counterarguments = thesisAi.table("counterarguments", {
  id:             serial("id").primaryKey(),
  reviewId:       integer("review_id").notNull().references(() => thesisReviews.id, { onDelete: "cascade" }),
  body:           text("body").notNull(),
  classification: varchar("classification", { length: 20 }), // 'knew' | 'manageable' | 'changes_view' | null
  sortOrder:      smallint("sort_order").notNull().default(0),
})

export const counterargumentsRelations = relations(counterarguments, ({ one }) => ({
  review: one(thesisReviews, { fields: [counterarguments.reviewId], references: [thesisReviews.id] }),
}))

// Final decision — one per review
export const decisions = thesisAi.table("decisions", {
  id:           serial("id").primaryKey(),
  reviewId:     integer("review_id").notNull().references(() => thesisReviews.id, { onDelete: "cascade" }),
  action:       varchar("action", { length: 20 }).notNull(), // 'invest' | 'pass' | 'wait' | 'reduce'
  rationale:    text("rationale").notNull(),
  positionSize: varchar("position_size", { length: 50 }),
  outcomeNote:  text("outcome_note"),
  decidedAt:    timestamp("decided_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("decisions_review_id_unique").on(t.reviewId),
])

export const decisionsRelations = relations(decisions, ({ one }) => ({
  review: one(thesisReviews, { fields: [decisions.reviewId], references: [thesisReviews.id] }),
}))
