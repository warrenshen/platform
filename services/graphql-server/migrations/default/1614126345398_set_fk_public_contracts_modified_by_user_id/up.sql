alter table "public"."contracts"
           add constraint "contracts_modified_by_user_id_fkey"
           foreign key ("modified_by_user_id")
           references "public"."users"
           ("id") on update restrict on delete restrict;
