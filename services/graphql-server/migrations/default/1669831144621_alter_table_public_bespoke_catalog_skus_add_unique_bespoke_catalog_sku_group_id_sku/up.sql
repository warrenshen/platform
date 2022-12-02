alter table "public"."bespoke_catalog_skus" add constraint "bespoke_catalog_skus_bespoke_catalog_sku_group_id_sku_key" unique ("bespoke_catalog_sku_group_id", "sku");
