alter table "public"."metrc_deliveries" add constraint "metrc_deliveries_delivery_id_us_state_key" unique ("delivery_id", "us_state");
