alter table "public"."company_partnership_requests"
           add constraint "company_partnership_requests_company_type_fkey"
           foreign key ("company_type")
           references "public"."company_type"
           ("value") on update restrict on delete restrict;
