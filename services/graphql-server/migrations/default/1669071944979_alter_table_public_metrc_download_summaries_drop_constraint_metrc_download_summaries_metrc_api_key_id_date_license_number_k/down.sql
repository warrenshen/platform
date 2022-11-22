alter table "public"."metrc_download_summaries" add constraint "metrc_download_summaries_date_metrc_api_key_id_license_number_key" unique ("date", "metrc_api_key_id", "license_number");
