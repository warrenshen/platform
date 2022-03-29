CREATE INDEX IF NOT EXISTS metrc_download_summaries_company_id_metrc_key_license_date_key ON metrc_download_summaries (company_id, metrc_api_key_id, license_number, date);
