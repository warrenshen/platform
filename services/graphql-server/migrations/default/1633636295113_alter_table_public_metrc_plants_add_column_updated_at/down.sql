DROP TRIGGER IF EXISTS "set_public_metrc_plants_updated_at" ON "public"."metrc_plants";
ALTER TABLE "public"."metrc_plants" DROP COLUMN "updated_at";
