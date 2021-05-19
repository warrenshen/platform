alter table "public"."ebba_application_files"
           add constraint "ebba_application_files_ebba_application_id_fkey"
           foreign key ("ebba_application_id")
           references "public"."ebba_applications"
           ("id") on update restrict on delete restrict;
