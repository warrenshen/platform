alter table "public"."metrc_sales_transactions"
           add constraint "metrc_sales_transactions_receipt_row_id_fkey"
           foreign key ("receipt_row_id")
           references "public"."metrc_sales_receipts"
           ("id") on update restrict on delete restrict;
