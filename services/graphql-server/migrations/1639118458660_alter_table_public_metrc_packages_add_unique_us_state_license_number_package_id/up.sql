alter table "public"."metrc_packages" add constraint "metrc_packages_us_state_license_number_package_id_key" unique ("us_state", "license_number", "package_id");
