alter table "public"."customer_surveillance_results" add constraint "customer_surveillance_results_company_id_qualifying_date_key" unique ("company_id", "qualifying_date");
