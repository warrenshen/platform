alter table "public"."metrc_packages" drop constraint "metrc_packages_package_id_key";
alter table "public"."metrc_packages" add constraint "metrc_packages_us_state_package_id_key" unique ("us_state", "package_id");
