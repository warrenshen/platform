alter table "public"."company_settings"
           add constraint "company_settings_advances_bank_account_id_fkey"
           foreign key ("advances_bank_account_id")
           references "public"."bank_accounts"
           ("id") on update restrict on delete restrict;
