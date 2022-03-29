alter table "public"."metrc_sales_receipts"
           add constraint "metrc_sales_receipts_company_id_fkey"
           foreign key ("company_id")
           references "public"."companies"
           ("id") on update restrict on delete restrict;
