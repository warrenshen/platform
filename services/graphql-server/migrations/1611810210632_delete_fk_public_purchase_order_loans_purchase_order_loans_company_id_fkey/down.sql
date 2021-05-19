alter table "public"."purchase_order_loans" add foreign key ("company_id") references "public"."companies"("id") on update restrict on delete restrict;
