alter table "public"."financial_summaries" add constraint "financial_summaries_company_id_date_key" unique ("company_id", "date");
