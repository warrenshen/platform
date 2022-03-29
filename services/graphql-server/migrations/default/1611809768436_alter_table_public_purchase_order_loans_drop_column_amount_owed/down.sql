ALTER TABLE "public"."purchase_order_loans" ADD COLUMN "amount_owed" numeric;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "amount_owed" DROP NOT NULL;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "amount_owed" SET DEFAULT 0;
