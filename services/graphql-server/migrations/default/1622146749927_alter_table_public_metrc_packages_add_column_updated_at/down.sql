DROP TRIGGER IF EXISTS "set_public_metrc_packages_updated_at" ON "public"."metrc_packages";
ALTER TABLE "public"."metrc_packages" DROP COLUMN "updated_at";
