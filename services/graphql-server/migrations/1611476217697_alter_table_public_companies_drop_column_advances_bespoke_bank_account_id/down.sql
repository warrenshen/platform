ALTER TABLE "public"."companies" ADD COLUMN "advances_bespoke_bank_account_id" uuid;
ALTER TABLE "public"."companies" ALTER COLUMN "advances_bespoke_bank_account_id" DROP NOT NULL;
ALTER TABLE "public"."companies" ADD CONSTRAINT companies_advances_bespoke_bank_account_id_fkey FOREIGN KEY (advances_bespoke_bank_account_id) REFERENCES "public"."bank_accounts" (id) ON DELETE restrict ON UPDATE restrict;
