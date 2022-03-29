alter table "public"."purchase_order_loans"
           add constraint "purchase_order_loans_requested_by_user_id_fkey"
           foreign key ("requested_by_user_id")
           references "public"."users"
           ("id") on update restrict on delete restrict;
