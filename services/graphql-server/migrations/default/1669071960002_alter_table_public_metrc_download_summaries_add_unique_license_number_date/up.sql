alter table "public"."metrc_download_summaries" add constraint "metrc_download_summaries_license_number_date_key" unique ("license_number", "date");
