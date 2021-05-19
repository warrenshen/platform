alter table "public"."companies"
           add constraint "companies_company_type_fkey"
           foreign key ("company_type")
           references "public"."company_type"
           ("value") on update restrict on delete restrict;
