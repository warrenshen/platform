COMMENT ON COLUMN "public"."companies"."next_loan_identifier" IS E'The latest loan identifier created for loans belonging to this company; increment this value to get a new loan identifier for a new loan';
alter table "public"."companies" rename column "next_loan_identifier" to "latest_loan_identifier";
