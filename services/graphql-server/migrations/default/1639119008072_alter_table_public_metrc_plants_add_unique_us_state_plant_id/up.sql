alter table "public"."metrc_plants" drop constraint "metrc_plants_plant_id_key";
alter table "public"."metrc_plants" add constraint "metrc_plants_us_state_plant_id_key" unique ("us_state", "plant_id");
