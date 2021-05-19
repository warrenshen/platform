alter table "public"."company_settings"
           add constraint "company_settings_product_type_fkey"
           foreign key ("product_type")
           references "public"."product_type"
           ("value") on update restrict on delete restrict;
