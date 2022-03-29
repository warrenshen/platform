COMMENT ON COLUMN "public"."company_vendor_partnerships"."verified_at" IS E'Serves dual purpose of telling us when the vendor was approved';
alter table "public"."company_vendor_partnerships" rename column "verified_at" to "approved_at";
