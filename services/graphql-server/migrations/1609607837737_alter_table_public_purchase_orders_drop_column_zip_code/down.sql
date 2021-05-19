ALTER TABLE "public"."purchase_orders" ADD COLUMN "zip_code" text;
ALTER TABLE "public"."purchase_orders" ALTER COLUMN "zip_code" DROP NOT NULL;
