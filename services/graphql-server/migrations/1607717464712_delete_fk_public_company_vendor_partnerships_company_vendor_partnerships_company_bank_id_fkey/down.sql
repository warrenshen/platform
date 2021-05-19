alter table "public"."company_vendor_partnerships" add foreign key ("vendor_bank_id") references "public"."company_banks"("id") on update restrict on delete restrict;
