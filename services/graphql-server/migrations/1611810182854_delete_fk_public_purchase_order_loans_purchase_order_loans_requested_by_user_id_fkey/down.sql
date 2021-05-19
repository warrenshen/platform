alter table "public"."purchase_order_loans" add foreign key ("requested_by_user_id") references "public"."users"("id") on update restrict on delete restrict;
