alter table "public"."company_vendor_contacts" add column "created_at" timestamptz
 not null default now();
