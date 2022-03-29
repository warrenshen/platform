alter table "public"."metrc_transfers"
           add constraint "metrc_transfers_vendor_id_fkey"
           foreign key ("vendor_id")
           references "public"."companies"
           ("id") on update restrict on delete restrict;
