alter table "public"."company_deliveries" drop constraint "company_deliveries_us_state_company_id_transfer_row_id_delivery";
alter table "public"."company_deliveries" add constraint "company_deliveries_us_state_license_number_company_id_transfer_row_id_delivery_row_id_key" unique ("us_state", "license_number", "company_id", "transfer_row_id", "delivery_row_id");
