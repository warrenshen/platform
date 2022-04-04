alter table "public"."debt_facility_capacities"
  add constraint "debt_facility_capacities_changed_by_fkey"
  foreign key ("changed_by")
  references "public"."users"
  ("id") on update restrict on delete restrict;
