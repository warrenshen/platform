alter table "public"."company_deliveries" drop constraint "company_deliveries_us_state_company_id_transfer_row_id_delivery_row_id_key";
alter table "public"."company_deliveries" add constraint "company_deliveries_us_state_transfer_row_id_delivery_row_id_key" unique ("us_state", "transfer_row_id", "delivery_row_id");
