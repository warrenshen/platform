ALTER TABLE "public"."purchase_orders" ADD COLUMN "parent_purchase_order_id" uuid;
ALTER TABLE "public"."purchase_orders" ALTER COLUMN "parent_purchase_order_id" DROP NOT NULL;
