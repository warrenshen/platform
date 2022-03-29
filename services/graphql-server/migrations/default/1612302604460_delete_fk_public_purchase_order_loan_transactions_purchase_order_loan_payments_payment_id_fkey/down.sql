alter table "public"."purchase_order_loan_transactions" add foreign key ("transaction_id") references "public"."payments"("id") on update restrict on delete restrict;
