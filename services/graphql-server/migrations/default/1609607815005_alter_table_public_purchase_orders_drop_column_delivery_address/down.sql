ALTER TABLE "public"."purchase_orders" ADD COLUMN "delivery_address" text;
ALTER TABLE "public"."purchase_orders" ALTER COLUMN "delivery_address" DROP NOT NULL;
