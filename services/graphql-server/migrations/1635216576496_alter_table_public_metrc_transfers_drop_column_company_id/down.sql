ALTER TABLE "public"."metrc_transfers" ADD COLUMN "company_id" uuid;
ALTER TABLE "public"."metrc_transfers" ALTER COLUMN "company_id" DROP NOT NULL;
