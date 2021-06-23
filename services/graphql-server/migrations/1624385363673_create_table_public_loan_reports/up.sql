CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."loan_reports"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "repayment_date" date, "total_principal_paid" numeric, "total_interest_paid" numeric, "total_fees_paid" numeric, "financing_period" integer, "financing_day_limit" integer, PRIMARY KEY ("id") );
