alter table "public"."metrc_sales_receipts" drop constraint "metrc_sales_receipts_us_state_receipt_id_key";
alter table "public"."metrc_sales_receipts" add constraint "metrc_sales_receipts_receipt_id_key" unique ("receipt_id");
