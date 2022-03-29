alter table "public"."company_settings"
           add constraint "company_settings_collections_bank_account_id_fkey"
           foreign key ("collections_bank_account_id")
           references "public"."bank_accounts"
           ("id") on update restrict on delete restrict;
