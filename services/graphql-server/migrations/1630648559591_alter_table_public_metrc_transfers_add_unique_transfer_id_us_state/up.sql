alter table "public"."metrc_transfers" add constraint "metrc_transfers_transfer_id_us_state_key" unique ("transfer_id", "us_state");
