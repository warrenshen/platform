alter table "public"."company_vendor_partnerships"
           add constraint "company_vendor_partnerships_vendor_agreement_id_fkey"
           foreign key ("vendor_agreement_id")
           references "public"."company_agreements"
           ("id") on update restrict on delete restrict;
