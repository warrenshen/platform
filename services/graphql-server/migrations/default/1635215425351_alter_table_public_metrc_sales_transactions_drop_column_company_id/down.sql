ALTER TABLE "public"."metrc_sales_transactions" ADD COLUMN "company_id" uuid;
ALTER TABLE "public"."metrc_sales_transactions" ALTER COLUMN "company_id" DROP NOT NULL;
ALTER TABLE "public"."metrc_sales_transactions" ADD CONSTRAINT metrc_sales_transactions_company_id_fkey FOREIGN KEY (company_id) REFERENCES "public"."companies" (id) ON DELETE restrict ON UPDATE restrict;
