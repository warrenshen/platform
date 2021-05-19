alter table "public"."loans" drop constraint "loans_status_fkey",
             add constraint "loans_status_fkey"
             foreign key ("status")
             references "public"."loan_status"
             ("value") on update restrict on delete restrict;
