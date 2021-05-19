COMMENT ON COLUMN "public"."loans"."requested_origination_date" IS E'';
alter table "public"."loans" rename column "requested_payment_date" to "requested_origination_date";
