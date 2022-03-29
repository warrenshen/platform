alter table "public"."companies"
           add constraint "companies_company_settings_id_fkey"
           foreign key ("company_settings_id")
           references "public"."company_settings"
           ("id") on update restrict on delete restrict;
