alter table "public"."contracts" add foreign key ("product_type") references "public"."product_type"("value") on update restrict on delete restrict;
