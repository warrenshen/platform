alter table "public"."company_settings"
           add constraint "company_settings_metrc_api_key_id_fkey"
           foreign key ("metrc_api_key_id")
           references "public"."metrc_api_keys"
           ("id") on update restrict on delete restrict;
