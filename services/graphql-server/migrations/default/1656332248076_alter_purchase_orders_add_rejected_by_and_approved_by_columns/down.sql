ALTER TABLE "public"."purchase_orders" DROP COLUMN "approved_by";
ALTER TABLE "public"."purchase_orders" DROP CONSTRAINT "purchase_orders_approved_by_fkey"

ALTER TABLE "public"."purchase_orders" DROP COLUMN "rejected_by";
ALTER TABLE "public"."purchase_orders" DROP CONSTRAINT "purchase_orders_rejected_by_fkey"
