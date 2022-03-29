alter table "public"."debt_facility_capacities"
  add constraint "debt_facility_capacities_debt_facility_id_fkey"
  foreign key ("debt_facility_id")
  references "public"."debt_facilities"
  ("id") on update restrict on delete restrict;
