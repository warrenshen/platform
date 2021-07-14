alter table "public"."metrc_deliveries"
           add constraint "metrc_deliveries_transfer_row_id_fkey"
           foreign key ("transfer_row_id")
           references "public"."metrc_transfers"
           ("id") on update restrict on delete restrict;
