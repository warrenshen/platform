ALTER TABLE "public"."bank_accounts" ADD COLUMN "created_at" timestamptz NULL DEFAULT now();
