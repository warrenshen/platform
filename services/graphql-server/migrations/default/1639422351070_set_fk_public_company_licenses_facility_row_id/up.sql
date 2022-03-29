alter table "public"."company_licenses"
           add constraint "company_licenses_facility_row_id_fkey"
           foreign key ("facility_row_id")
           references "public"."company_facilities"
           ("id") on update restrict on delete restrict;
