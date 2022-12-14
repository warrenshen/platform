alter table "public"."company_payor_contacts" add column "updated_at" timestamptz
 not null default now();
