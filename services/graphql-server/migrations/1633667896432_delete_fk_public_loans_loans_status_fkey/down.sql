alter table "public"."loans" add foreign key ("status") references "public"."loan_status"("value") on update restrict on delete restrict;
