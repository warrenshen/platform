ALTER TABLE "public"."purchase_order_loans" ADD COLUMN "origination_date" date;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "origination_date" DROP NOT NULL;
