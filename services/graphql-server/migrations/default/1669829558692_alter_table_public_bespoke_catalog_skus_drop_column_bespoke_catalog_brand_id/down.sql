alter table "public"."bespoke_catalog_skus" alter column "bespoke_catalog_brand_id" drop not null;
alter table "public"."bespoke_catalog_skus" add column "bespoke_catalog_brand_id" uuid;
