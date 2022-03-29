alter table "public"."loans"
           add constraint "loans_rejected_by_user_id_fkey"
           foreign key ("rejected_by_user_id")
           references "public"."users"
           ("id") on update restrict on delete restrict;
