alter table "public"."metrc_sales_receipts" add constraint "metrc_sales_receipts_receipt_number_us_state_key" unique ("receipt_number", "us_state");
