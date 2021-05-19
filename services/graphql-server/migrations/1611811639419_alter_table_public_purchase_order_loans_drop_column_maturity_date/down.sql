ALTER TABLE "public"."purchase_order_loans" ADD COLUMN "maturity_date" date;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "maturity_date" DROP NOT NULL;
