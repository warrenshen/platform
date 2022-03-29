alter table "public"."bank_financial_summaries" add constraint "bank_financial_summaries_date_product_type_key" unique ("date", "product_type");
