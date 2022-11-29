alter table "public"."metrc_to_bespoke_catalog_skus" add constraint "metrc_to_bespoke_catalog_skus_product_category_name_product_name" unique ("product_category_name", "product_name");
