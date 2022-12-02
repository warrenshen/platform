CREATE TABLE "public"."bespoke_catalog_sku_groups" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "sku_group_name" text NOT NULL, "bespoke_catalog_brand_id" uuid NOT NULL, "is_deleted" bool NOT NULL DEFAULT false, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" Timestamp, PRIMARY KEY ("id") , FOREIGN KEY ("bespoke_catalog_brand_id") REFERENCES "public"."bespoke_catalog_brands"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"), UNIQUE ("bespoke_catalog_brand_id", "sku_group_name"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;
