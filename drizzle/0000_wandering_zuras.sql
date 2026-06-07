CREATE SCHEMA "thesis_ai";
--> statement-breakpoint
CREATE TABLE "thesis_ai"."counterarguments" (
	"id" serial PRIMARY KEY NOT NULL,
	"review_id" integer NOT NULL,
	"body" text NOT NULL,
	"classification" varchar(20),
	"sort_order" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thesis_ai"."decisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"review_id" integer NOT NULL,
	"action" varchar(20) NOT NULL,
	"rationale" text NOT NULL,
	"position_size" varchar(50),
	"outcome_note" text,
	"decided_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "decisions_review_id_unique" UNIQUE("review_id")
);
--> statement-breakpoint
CREATE TABLE "thesis_ai"."thesis_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" varchar(20) NOT NULL,
	"thesis" text NOT NULL,
	"source_material" text,
	"critique_raw" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "thesis_ai"."counterarguments" ADD CONSTRAINT "counterarguments_review_id_thesis_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "thesis_ai"."thesis_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thesis_ai"."decisions" ADD CONSTRAINT "decisions_review_id_thesis_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "thesis_ai"."thesis_reviews"("id") ON DELETE cascade ON UPDATE no action;