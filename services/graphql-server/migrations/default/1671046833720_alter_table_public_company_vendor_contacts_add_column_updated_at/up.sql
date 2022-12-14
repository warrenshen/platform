alter table "public"."company_vendor_contacts" add column "updated_at" timestamptz
 not null default now();
