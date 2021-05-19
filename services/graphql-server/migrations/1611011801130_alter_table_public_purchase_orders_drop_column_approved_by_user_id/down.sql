ALTER TABLE "public"."purchase_orders" ADD COLUMN "approved_by_user_id" uuid;
ALTER TABLE "public"."purchase_orders" ALTER COLUMN "approved_by_user_id" DROP NOT NULL;
