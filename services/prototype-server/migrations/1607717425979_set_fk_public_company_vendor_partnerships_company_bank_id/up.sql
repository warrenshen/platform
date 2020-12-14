alter table "public"."company_vendor_partnerships"
           add constraint "company_vendor_partnerships_company_bank_id_fkey"
           foreign key ("company_bank_id")
           references "public"."company_banks"
           ("id") on update restrict on delete restrict;
