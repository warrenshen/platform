ALTER TABLE "public"."purchase_orders" ADD COLUMN "created_at" timestamptz NULL DEFAULT now();
