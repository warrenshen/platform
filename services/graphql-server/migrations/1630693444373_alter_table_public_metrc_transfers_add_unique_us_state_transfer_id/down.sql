alter table "public"."metrc_transfers" drop constraint "metrc_transfers_us_state_transfer_id_key";
alter table "public"."metrc_transfers" add constraint "metrc_transfers_transfer_id_us_state_key" unique ("transfer_id", "us_state");
