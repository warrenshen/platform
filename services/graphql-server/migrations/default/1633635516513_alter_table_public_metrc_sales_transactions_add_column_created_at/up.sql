ALTER TABLE "public"."metrc_sales_transactions" ADD COLUMN IF NOT EXISTS "created_at" timestamptz NULL DEFAULT now();
