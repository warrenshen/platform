CREATE EXTENSION IF NOT EXISTS pgcrypto;
alter table "public"."debt_facility_events" add column "id" uuid
 null default gen_random_uuid();
