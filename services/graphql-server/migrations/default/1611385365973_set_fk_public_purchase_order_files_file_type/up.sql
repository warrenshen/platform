alter table "public"."purchase_order_files"
           add constraint "purchase_order_files_file_type_fkey"
           foreign key ("file_type")
           references "public"."purchase_order_file_type"
           ("value") on update restrict on delete restrict;
