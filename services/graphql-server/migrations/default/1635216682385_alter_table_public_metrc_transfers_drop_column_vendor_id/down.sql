ALTER TABLE "public"."metrc_transfers" ADD COLUMN "vendor_id" uuid;
ALTER TABLE "public"."metrc_transfers" ALTER COLUMN "vendor_id" DROP NOT NULL;
