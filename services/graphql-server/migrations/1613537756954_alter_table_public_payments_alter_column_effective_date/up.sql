COMMENT ON COLUMN "public"."payments"."effective_date" IS E'The date that this payment or advance is settled and is effective for financial calculations';
alter table "public"."payments" rename column "effective_date" to "settlement_date";
