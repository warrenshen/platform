DROP TRIGGER IF EXISTS "set_public_metrc_plant_batches_updated_at" ON "public"."metrc_plant_batches";
ALTER TABLE "public"."metrc_plant_batches" DROP COLUMN "updated_at";
