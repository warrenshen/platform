alter table "public"."metrc_transfers" drop constraint "metrc_transfers_transfer_id_us_state_key";
alter table "public"."metrc_transfers" add constraint "metrc_transfers_us_state_transfer_id_key" unique ("us_state", "transfer_id");
