DROP TRIGGER IF EXISTS "set_public_metrc_sales_receipts_updated_at" ON "public"."metrc_sales_receipts";
ALTER TABLE "public"."metrc_sales_receipts" DROP COLUMN "updated_at";
