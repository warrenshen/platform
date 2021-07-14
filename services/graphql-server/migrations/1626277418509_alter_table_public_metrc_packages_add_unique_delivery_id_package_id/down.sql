alter table "public"."metrc_packages" drop constraint "metrc_packages_delivery_id_package_id_key";
alter table "public"."metrc_packages" add constraint "metrc_packages_package_id_key" unique ("package_id");
