CREATE  INDEX "company_settings_is_dummy_account_key" on
  "public"."company_settings" using btree ("is_dummy_account");
