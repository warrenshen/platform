DROP TRIGGER IF EXISTS "set_public_transactions_updated_at" ON "public"."transactions";
ALTER TABLE "public"."transactions" DROP COLUMN "updated_at";
