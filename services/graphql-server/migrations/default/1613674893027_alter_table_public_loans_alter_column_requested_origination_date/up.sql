COMMENT ON COLUMN "public"."loans"."requested_origination_date" IS E'When the user first requests a loan, they request what day they want the payment to be made to them';
alter table "public"."loans" rename column "requested_origination_date" to "requested_payment_date";
