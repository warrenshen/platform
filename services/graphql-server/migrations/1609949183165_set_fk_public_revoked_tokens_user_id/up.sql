alter table "public"."revoked_tokens"
           add constraint "revoked_tokens_user_id_fkey"
           foreign key ("user_id")
           references "public"."users"
           ("id") on update restrict on delete restrict;
