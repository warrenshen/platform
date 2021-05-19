ALTER TABLE "public"."companies" ADD COLUMN "collections_bespoke_bank_account_id" uuid;
ALTER TABLE "public"."companies" ALTER COLUMN "collections_bespoke_bank_account_id" DROP NOT NULL;
ALTER TABLE "public"."companies" ADD CONSTRAINT companies_assigned_bespoke_bank_account_id_fkey FOREIGN KEY (collections_bespoke_bank_account_id) REFERENCES "public"."bank_accounts" (id) ON DELETE restrict ON UPDATE restrict;
