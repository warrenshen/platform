alter table "public"."metrc_deliveries" drop constraint "metrc_deliveries_us_state_transfer_row_id_delivery_id_key";
alter table "public"."metrc_deliveries" add constraint "metrc_deliveries_us_state_delivery_id_key" unique ("us_state", "delivery_id");
