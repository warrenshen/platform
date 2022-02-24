alter table "public"."users"
           add constraint "users_parent_company_id_fkey"
           foreign key ("parent_company_id")
           references "public"."parent_companies"
           ("id") on update restrict on delete restrict;
