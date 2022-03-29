ALTER TABLE "public"."metrc_sales_transactions" ADD COLUMN "query_start_date" date;
ALTER TABLE "public"."metrc_sales_transactions" ALTER COLUMN "query_start_date" DROP NOT NULL;
