alter table "public"."company_partnership_requests" add column "updated_at" timestamptz
 null default now();
