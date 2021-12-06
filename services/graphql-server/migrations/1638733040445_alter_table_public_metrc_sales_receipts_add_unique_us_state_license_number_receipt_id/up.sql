alter table "public"."metrc_sales_receipts" add constraint "metrc_sales_receipts_us_state_license_number_receipt_id_key" unique ("us_state", "license_number", "receipt_id");
