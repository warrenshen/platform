DROP TRIGGER IF EXISTS "set_public_metrc_deliveries_updated_at" ON "public"."metrc_deliveries";
ALTER TABLE "public"."metrc_deliveries" DROP COLUMN "updated_at";
