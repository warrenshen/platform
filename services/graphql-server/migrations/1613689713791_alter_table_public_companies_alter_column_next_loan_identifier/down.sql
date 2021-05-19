COMMENT ON COLUMN "public"."companies"."next_loan_identifier" IS E'';
alter table "public"."companies" rename column "latest_loan_identifier" to "next_loan_identifier";
