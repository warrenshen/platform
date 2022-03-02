alter table "public"."loan_reports"
  add constraint "loan_reports_debt_facility_id_fkey"
  foreign key ("debt_facility_id")
  references "public"."debt_facilities"
  ("id") on update restrict on delete restrict;
