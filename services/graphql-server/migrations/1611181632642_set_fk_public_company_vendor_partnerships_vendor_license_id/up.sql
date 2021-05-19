alter table "public"."company_vendor_partnerships"
           add constraint "company_vendor_partnerships_vendor_license_id_fkey"
           foreign key ("vendor_license_id")
           references "public"."company_licenses"
           ("id") on update restrict on delete restrict;
