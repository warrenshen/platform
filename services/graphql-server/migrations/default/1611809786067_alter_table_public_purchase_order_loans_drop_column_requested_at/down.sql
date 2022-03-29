ALTER TABLE "public"."purchase_order_loans" ADD COLUMN "requested_at" timestamptz;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "requested_at" DROP NOT NULL;
