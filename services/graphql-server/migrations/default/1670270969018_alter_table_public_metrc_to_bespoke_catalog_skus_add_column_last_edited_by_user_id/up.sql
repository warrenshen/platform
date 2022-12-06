ALTER TABLE "public"."metrc_to_bespoke_catalog_skus" ADD COLUMN "last_edited_by_user_id" uuid NULL;
ALTER TABLE "public"."metrc_to_bespoke_catalog_skus"
  ADD CONSTRAINT "metrc_to_bespoke_catalog_skus_last_edited_by_user_id_fkey"
  FOREIGN KEY ("last_edited_by_user_id")
  REFERENCES "public"."users"
  ("id") ON UPDATE RESTRICT ON DELETE RESTRICT;
