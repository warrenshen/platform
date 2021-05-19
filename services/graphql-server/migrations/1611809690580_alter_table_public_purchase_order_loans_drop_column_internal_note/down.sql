ALTER TABLE "public"."purchase_order_loans" ADD COLUMN "internal_note" text;
ALTER TABLE "public"."purchase_order_loans" ALTER COLUMN "internal_note" DROP NOT NULL;
