ALTER TABLE "public"."payments" ADD COLUMN "bespoke_bank_account_id" uuid;
ALTER TABLE "public"."payments" ALTER COLUMN "bespoke_bank_account_id" DROP NOT NULL;
ALTER TABLE "public"."payments" ADD CONSTRAINT payments_bespoke_bank_account_id_fkey FOREIGN KEY (bespoke_bank_account_id) REFERENCES "public"."bank_accounts" (id) ON DELETE restrict ON UPDATE restrict;
