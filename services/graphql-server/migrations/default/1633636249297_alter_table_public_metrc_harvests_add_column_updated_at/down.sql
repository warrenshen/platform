DROP TRIGGER IF EXISTS "set_public_metrc_harvests_updated_at" ON "public"."metrc_harvests";
ALTER TABLE "public"."metrc_harvests" DROP COLUMN "updated_at";
