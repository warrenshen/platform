alter table "public"."purchase_order_loans"
           add constraint "purchase_order_loans_status_fkey"
           foreign key ("status")
           references "public"."request_status"
           ("value") on update restrict on delete restrict;
