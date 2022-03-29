DROP TRIGGER IF EXISTS "set_public_bank_accounts_updated_at" ON "public"."bank_accounts";
ALTER TABLE "public"."bank_accounts" DROP COLUMN "updated_at";
