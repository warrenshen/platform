alter table "public"."financial_summaries"
           add constraint "financial_summaries_product_type_fkey"
           foreign key ("product_type")
           references "public"."product_type"
           ("value") on update restrict on delete restrict;
