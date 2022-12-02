alter table "public"."bespoke_catalog_skus"
  add constraint "bespoke_catalog_skus_bespoke_catalog_sku_group_id_fkey"
  foreign key ("bespoke_catalog_sku_group_id")
  references "public"."bespoke_catalog_sku_groups"
  ("id") on update restrict on delete restrict;
