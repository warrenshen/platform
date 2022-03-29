alter table "public"."ebba_applications"
           add constraint "ebba_applications_status_fkey"
           foreign key ("status")
           references "public"."request_status"
           ("value") on update restrict on delete restrict;
