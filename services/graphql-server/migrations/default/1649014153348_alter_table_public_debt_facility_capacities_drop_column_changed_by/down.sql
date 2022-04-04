alter table "public"."debt_facility_capacities" alter column "changed_by" drop not null;
alter table "public"."debt_facility_capacities" add column "changed_by" text;
