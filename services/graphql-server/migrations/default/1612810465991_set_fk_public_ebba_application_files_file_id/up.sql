alter table "public"."ebba_application_files"
           add constraint "ebba_application_files_file_id_fkey"
           foreign key ("file_id")
           references "public"."files"
           ("id") on update restrict on delete restrict;
