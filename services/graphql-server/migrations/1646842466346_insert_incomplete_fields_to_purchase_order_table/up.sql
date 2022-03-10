ALTER TABLE "public"."purchase_orders" ADD COLUMN "incompleted_at" timestamptz NULL;
ALTER TABLE "public"."purchase_orders" ADD COLUMN "bank_incomplete_note" text NULL;
