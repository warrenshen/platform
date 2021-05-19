ALTER TABLE "public"."bank_financial_summaries" ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT now();
