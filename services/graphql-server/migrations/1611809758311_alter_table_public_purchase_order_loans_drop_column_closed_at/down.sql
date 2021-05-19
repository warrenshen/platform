ALTER TABLE "public"."purchase_order_loans" ADD COLUMN "closed_at" timestamptz;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "closed_at" DROP NOT NULL;
