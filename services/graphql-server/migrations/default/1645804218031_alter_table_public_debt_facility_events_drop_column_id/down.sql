alter table "public"."debt_facility_events" alter column "id" set default nextval('debt_facility_event_id_seq'::regclass);
alter table "public"."debt_facility_events" alter column "id" drop not null;
alter table "public"."debt_facility_events" add column "id" int4;
