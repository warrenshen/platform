alter table "public"."contracts"
           add constraint "contracts_terminated_by_user_id_fkey"
           foreign key ("terminated_by_user_id")
           references "public"."users"
           ("id") on update restrict on delete restrict;
