DROP TRIGGER IF EXISTS "set_public_purchase_order_files_updated_at" ON "public"."purchase_order_files";
ALTER TABLE "public"."purchase_order_files" DROP COLUMN "updated_at";
