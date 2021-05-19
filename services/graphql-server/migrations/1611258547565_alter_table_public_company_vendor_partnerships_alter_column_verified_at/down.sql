COMMENT ON COLUMN "public"."company_vendor_partnerships"."verified_at" IS E'';
alter table "public"."company_vendor_partnerships" rename column "approved_at" to "verified_at";
