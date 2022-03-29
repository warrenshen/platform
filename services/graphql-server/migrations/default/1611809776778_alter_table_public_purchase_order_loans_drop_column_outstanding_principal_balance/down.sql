ALTER TABLE "public"."purchase_order_loans" ADD COLUMN "outstanding_principal_balance" numeric;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "outstanding_principal_balance" DROP NOT NULL;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "outstanding_principal_balance" SET DEFAULT 0;
