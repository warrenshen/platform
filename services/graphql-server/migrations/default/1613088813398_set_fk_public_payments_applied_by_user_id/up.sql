alter table "public"."payments"
           add constraint "payments_applied_by_user_id_fkey"
           foreign key ("applied_by_user_id")
           references "public"."users"
           ("id") on update restrict on delete restrict;
