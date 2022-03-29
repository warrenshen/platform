alter table "public"."metrc_deliveries"
           add constraint "metrc_deliveries_payor_id_fkey"
           foreign key ("payor_id")
           references "public"."companies"
           ("id") on update restrict on delete restrict;
