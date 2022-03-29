DROP TRIGGER IF EXISTS "set_public_purchase_orders_updated_at" ON "public"."purchase_orders";
ALTER TABLE "public"."purchase_orders" DROP COLUMN "updated_at";
