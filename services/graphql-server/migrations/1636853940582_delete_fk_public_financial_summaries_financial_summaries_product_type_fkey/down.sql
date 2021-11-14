alter table "public"."financial_summaries" add foreign key ("product_type") references "public"."product_type"("value") on update restrict on delete restrict;
