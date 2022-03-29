alter table "public"."company_licenses"
           add constraint "company_licenses_file_id_fkey"
           foreign key ("file_id")
           references "public"."files"
           ("id") on update restrict on delete restrict;
