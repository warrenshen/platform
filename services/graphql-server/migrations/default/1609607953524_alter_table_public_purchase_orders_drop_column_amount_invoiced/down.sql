ALTER TABLE "public"."purchase_orders" ADD COLUMN "amount_invoiced" money;
ALTER TABLE "public"."purchase_orders" ALTER COLUMN "amount_invoiced" DROP NOT NULL;
