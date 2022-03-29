DROP TRIGGER IF EXISTS "set_public_metrc_sales_transactions_updated_at" ON "public"."metrc_sales_transactions";
ALTER TABLE "public"."metrc_sales_transactions" DROP COLUMN "updated_at";
