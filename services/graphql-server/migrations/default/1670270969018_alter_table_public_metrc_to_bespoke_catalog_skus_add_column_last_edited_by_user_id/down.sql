ALTER TABLE "public"."metrc_to_bespoke_catalog_skus" DROP CONSTRAINT "metrc_to_bespoke_catalog_skus_last_edited_by_user_id_fkey";
ALTER TABLE "public"."metrc_to_bespoke_catalog_skus" DROP COLUMN IF EXISTS "last_edited_by_user_id";
