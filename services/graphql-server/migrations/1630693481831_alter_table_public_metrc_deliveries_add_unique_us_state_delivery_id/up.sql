alter table "public"."metrc_deliveries" drop constraint "metrc_deliveries_delivery_id_us_state_key";
alter table "public"."metrc_deliveries" add constraint "metrc_deliveries_us_state_delivery_id_key" unique ("us_state", "delivery_id");
