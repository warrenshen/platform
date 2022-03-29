alter table "public"."metrc_packages"
           add constraint "metrc_packages_delivery_row_id_fkey"
           foreign key ("delivery_row_id")
           references "public"."metrc_deliveries"
           ("id") on update restrict on delete restrict;
