alter table "public"."loans"
           add constraint "loans_loan_type_fkey"
           foreign key ("loan_type")
           references "public"."loan_type"
           ("value") on update restrict on delete restrict;
