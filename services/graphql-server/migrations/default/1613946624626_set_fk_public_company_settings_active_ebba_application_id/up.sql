alter table "public"."company_settings"
           add constraint "company_settings_active_ebba_application_id_fkey"
           foreign key ("active_ebba_application_id")
           references "public"."ebba_applications"
           ("id") on update restrict on delete restrict;
