alter table "public"."ebba_applications"
           add constraint "ebba_applications_company_id_fkey"
           foreign key ("company_id")
           references "public"."companies"
           ("id") on update restrict on delete restrict;
