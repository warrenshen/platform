ALTER TABLE "public"."purchase_orders" ADD COLUMN "city" text;
ALTER TABLE "public"."purchase_orders" ALTER COLUMN "city" DROP NOT NULL;
