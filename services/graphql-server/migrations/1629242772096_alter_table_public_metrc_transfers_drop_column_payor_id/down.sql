ALTER TABLE "public"."metrc_transfers" ADD COLUMN "payor_id" uuid;
ALTER TABLE "public"."metrc_transfers" ALTER COLUMN "payor_id" DROP NOT NULL;
