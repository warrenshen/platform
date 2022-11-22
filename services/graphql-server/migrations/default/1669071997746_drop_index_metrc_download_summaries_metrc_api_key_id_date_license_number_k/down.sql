CREATE  INDEX "metrc_download_summaries_metrc_api_key_id_date_license_number_k" on
  "public"."metrc_download_summaries" using btree ("date", "license_number", "metrc_api_key_id");
