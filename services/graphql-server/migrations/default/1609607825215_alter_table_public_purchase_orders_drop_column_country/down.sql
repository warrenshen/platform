ALTER TABLE "public"."purchase_orders" ADD COLUMN "country" text;
ALTER TABLE "public"."purchase_orders" ALTER COLUMN "country" DROP NOT NULL;
