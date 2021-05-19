ALTER TABLE "public"."purchase_order_loans" ADD COLUMN "company_id" uuid;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "company_id" DROP NOT NULL;
