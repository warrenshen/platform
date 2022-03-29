alter table "public"."purchase_order_files" drop constraint "purchase_order_files_pkey";
alter table "public"."purchase_order_files"
    add constraint "purchase_order_files_pkey" 
    primary key ( "purchase_order_id", "file_id" );
