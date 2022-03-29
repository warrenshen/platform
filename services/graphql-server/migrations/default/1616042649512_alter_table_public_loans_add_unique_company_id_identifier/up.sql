alter table "public"."loans" add constraint "loans_company_id_identifier_key" unique ("company_id", "identifier");
