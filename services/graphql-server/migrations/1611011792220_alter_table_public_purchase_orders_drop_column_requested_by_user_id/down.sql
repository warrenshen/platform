ALTER TABLE "public"."purchase_orders" ADD COLUMN "requested_by_user_id" uuid;
ALTER TABLE "public"."purchase_orders" ALTER COLUMN "requested_by_user_id" DROP NOT NULL;
