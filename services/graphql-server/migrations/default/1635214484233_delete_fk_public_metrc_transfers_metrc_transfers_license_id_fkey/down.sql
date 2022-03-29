alter table "public"."metrc_transfers" add foreign key ("license_id") references "public"."company_licenses"("id") on update restrict on delete restrict;
