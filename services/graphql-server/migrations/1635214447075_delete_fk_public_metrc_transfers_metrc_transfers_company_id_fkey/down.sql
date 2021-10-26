alter table "public"."metrc_transfers" add foreign key ("company_id") references "public"."companies"("id") on update restrict on delete restrict;
