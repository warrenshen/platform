alter table "public"."loans"
           add constraint "loans_status_fkey"
           foreign key ("status")
           references "public"."request_status"
           ("value") on update restrict on delete restrict;
