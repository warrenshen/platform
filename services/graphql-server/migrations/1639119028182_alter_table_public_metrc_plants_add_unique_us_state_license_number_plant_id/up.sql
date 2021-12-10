alter table "public"."metrc_plants" add constraint "metrc_plants_us_state_license_number_plant_id_key" unique ("us_state", "license_number", "plant_id");
