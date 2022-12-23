DROP INDEX IF EXISTS "public"."bespoke_catalog_brands_parent_company_id";
ALTER TABLE "public"."bespoke_catalog_brands" DROP CONSTRAINT "bespoke_catalog_brands_parent_company_id_fkey";
ALTER TABLE "public"."bespoke_catalog_brands" DROP COLUMN IF EXISTS "parent_company_id";
