DROP TRIGGER IF EXISTS "set_public_loan_reports_updated_at" ON "public"."loan_reports";
ALTER TABLE "public"."loan_reports" DROP COLUMN "updated_at";
