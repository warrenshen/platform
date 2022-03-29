alter table "public"."loans"
           add constraint "loans_loan_report_id_fkey"
           foreign key ("loan_report_id")
           references "public"."loan_reports"
           ("id") on update restrict on delete restrict;
