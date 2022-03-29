alter table "public"."payments"
           add constraint "payments_submitted_by_user_id_fkey"
           foreign key ("submitted_by_user_id")
           references "public"."users"
           ("id") on update restrict on delete restrict;
