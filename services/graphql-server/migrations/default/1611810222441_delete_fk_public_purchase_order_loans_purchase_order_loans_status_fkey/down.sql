alter table "public"."purchase_order_loans" add foreign key ("status") references "public"."request_status"("value") on update restrict on delete restrict;
