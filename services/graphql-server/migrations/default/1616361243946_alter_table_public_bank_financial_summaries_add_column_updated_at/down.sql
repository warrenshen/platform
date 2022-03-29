DROP TRIGGER IF EXISTS "set_public_bank_financial_summaries_updated_at" ON "public"."bank_financial_summaries";
ALTER TABLE "public"."bank_financial_summaries" DROP COLUMN "updated_at";
