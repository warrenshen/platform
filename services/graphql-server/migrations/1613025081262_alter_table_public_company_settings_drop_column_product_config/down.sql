ALTER TABLE "public"."company_settings" ADD COLUMN "product_config" jsonb;
ALTER TABLE "public"."company_settings" ALTER COLUMN "product_config" DROP NOT NULL;
ALTER TABLE "public"."company_settings" ALTER COLUMN "product_config" SET DEFAULT jsonb_build_object();
