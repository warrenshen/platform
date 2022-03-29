alter table "public"."company_vendor_partnerships" add constraint "company_vendor_partnerships_company_id_vendor_id_key" unique ("company_id", "vendor_id");
