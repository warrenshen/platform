DROP TRIGGER IF EXISTS "set_public_payments_updated_at" ON "public"."payments";
ALTER TABLE "public"."payments" DROP COLUMN "updated_at";
