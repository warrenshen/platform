ALTER TABLE "public"."company_settings" ADD COLUMN "product_config" jsonb NOT NULL DEFAULT jsonb_build_object();
