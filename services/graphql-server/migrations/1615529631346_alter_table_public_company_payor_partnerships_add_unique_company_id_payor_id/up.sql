alter table "public"."company_payor_partnerships" add constraint "company_payor_partnerships_company_id_payor_id_key" unique ("company_id", "payor_id");
