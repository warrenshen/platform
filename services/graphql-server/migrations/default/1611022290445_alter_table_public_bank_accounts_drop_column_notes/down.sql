ALTER TABLE "public"."bank_accounts" ADD COLUMN "notes" text;
ALTER TABLE "public"."bank_accounts" ALTER COLUMN "notes" DROP NOT NULL;
