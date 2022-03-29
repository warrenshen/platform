alter table "public"."metrc_download_summaries" drop constraint "metrc_download_summaries_company_id_metrc_api_key_id_licens_key";
alter table "public"."metrc_download_summaries" add constraint "metrc_download_summaries_metrc_api_key_id_date_license_number_key" unique ("metrc_api_key_id", "date", "license_number");
