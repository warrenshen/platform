ALTER TABLE "public"."metrc_transfers" ADD COLUMN "license_id" uuid;
ALTER TABLE "public"."metrc_transfers" ALTER COLUMN "license_id" DROP NOT NULL;
