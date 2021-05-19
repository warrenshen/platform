ALTER TABLE "public"."company_settings" ADD COLUMN "product_type" text;
ALTER TABLE "public"."company_settings" ALTER COLUMN "product_type" DROP NOT NULL;
ALTER TABLE "public"."company_settings" ADD CONSTRAINT company_settings_product_type_fkey FOREIGN KEY (product_type) REFERENCES "public"."product_type" (value) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE "public"."company_settings" ALTER COLUMN "product_type" SET DEFAULT 'none'::text;
