ALTER TABLE "public"."metrc_sales_transactions" ADD COLUMN "query_end_date" date;
ALTER TABLE "public"."metrc_sales_transactions" ALTER COLUMN "query_end_date" DROP NOT NULL;
