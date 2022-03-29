COMMENT ON COLUMN "public"."payments"."effective_date" IS E'The date that this payment or advance is settled or effective for financial calculations';
alter table "public"."payments" rename column "settlement_date" to "effective_date";
