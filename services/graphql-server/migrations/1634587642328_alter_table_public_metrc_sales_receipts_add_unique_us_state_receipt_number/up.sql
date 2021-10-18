alter table "public"."metrc_sales_receipts" drop constraint "metrc_sales_receipts_receipt_number_key";
alter table "public"."metrc_sales_receipts" add constraint "metrc_sales_receipts_us_state_receipt_number_key" unique ("us_state", "receipt_number");
