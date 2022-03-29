alter table "public"."purchase_order_loans"
           add constraint "purchase_order_loans_loan_id_fkey"
           foreign key ("loan_id")
           references "public"."loans"
           ("id") on update restrict on delete restrict;
