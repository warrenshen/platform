DROP TRIGGER IF EXISTS "set_public_financial_summaries_updated_at" ON "public"."financial_summaries";
ALTER TABLE "public"."financial_summaries" DROP COLUMN "updated_at";
