alter table "public"."company_partnership_requests"
           add constraint "company_partnership_requests_requested_by_user_id_fkey"
           foreign key ("requested_by_user_id")
           references "public"."users"
           ("id") on update restrict on delete restrict;
