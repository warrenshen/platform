CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."metrc_sales_receipts"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "receipt_number" text NOT NULL, "sales_customer_type" text NOT NULL, "sales_datetime" timestamptz NOT NULL, "total_packages" integer NOT NULL, "total_price" numeric NOT NULL, "payload" json NOT NULL, PRIMARY KEY ("id") , UNIQUE ("id"), UNIQUE ("receipt_number"));
