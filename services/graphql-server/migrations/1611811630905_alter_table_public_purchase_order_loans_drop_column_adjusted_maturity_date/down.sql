ALTER TABLE "public"."purchase_order_loans" ADD COLUMN "adjusted_maturity_date" date;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "adjusted_maturity_date" DROP NOT NULL;
