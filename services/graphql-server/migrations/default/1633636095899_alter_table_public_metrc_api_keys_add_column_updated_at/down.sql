DROP TRIGGER IF EXISTS "set_public_metrc_api_keys_updated_at" ON "public"."metrc_api_keys";
ALTER TABLE "public"."metrc_api_keys" DROP COLUMN "updated_at";
