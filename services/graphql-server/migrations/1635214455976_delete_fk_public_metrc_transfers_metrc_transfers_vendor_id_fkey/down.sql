alter table "public"."metrc_transfers" add foreign key ("vendor_id") references "public"."companies"("id") on update restrict on delete restrict;
