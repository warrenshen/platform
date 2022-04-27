alter table "public"."company_settings"
  add constraint "company_settings_account_manager_user_id_fkey"
  foreign key ("account_manager_user_id")
  references "public"."users"
  ("id") on update restrict on delete restrict;
