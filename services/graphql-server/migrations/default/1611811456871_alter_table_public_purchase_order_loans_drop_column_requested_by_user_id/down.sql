ALTER TABLE "public"."purchase_order_loans" ADD COLUMN "requested_by_user_id" uuid;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "requested_by_user_id" DROP NOT NULL;
