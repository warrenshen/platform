alter table "public"."company_payor_contacts" add column "created_at" timestamptz
 not null default now();
