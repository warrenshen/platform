ALTER TABLE "public"."purchase_order_loans" ADD COLUMN "status" text;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "status" DROP NOT NULL;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "status" SET DEFAULT 'drafted'::text;
