ALTER TABLE "public"."purchase_order_loans" ADD COLUMN "amount" numeric;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "amount" DROP NOT NULL;
