ALTER TABLE "public"."bank_accounts" ADD COLUMN "can_reverse_draft_ach" bool;
ALTER TABLE "public"."bank_accounts" ALTER COLUMN "can_reverse_draft_ach" DROP NOT NULL;
ALTER TABLE "public"."bank_accounts" ALTER COLUMN "can_reverse_draft_ach" SET DEFAULT false;
