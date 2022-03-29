DROP TRIGGER IF EXISTS "set_public_loans_updated_at" ON "public"."loans";
ALTER TABLE "public"."loans" DROP COLUMN "updated_at";
