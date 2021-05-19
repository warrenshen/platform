alter table "public"."purchase_orders"
           add constraint "purchase_orders_status_fkey"
           foreign key ("status")
           references "public"."request_status"
           ("value") on update restrict on delete restrict;
