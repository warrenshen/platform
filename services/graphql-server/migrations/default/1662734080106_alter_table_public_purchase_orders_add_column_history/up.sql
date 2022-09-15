ALTER TABLE "public"."purchase_orders" ADD COLUMN "history" JSONB NULL DEFAULT jsonb_build_array();
