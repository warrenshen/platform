CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."loans"("id" uuid DEFAULT gen_random_uuid(), "company_id" uuid NOT NULL, "amount" numeric NOT NULL, "maturity_date" date, "adjusted_maturity_date" date, "origination_date" date, "outstanding_principal_balance" numeric, "outstanding_interest" numeric, "outstanding_fees" numeric, "modified_by_user_id" uuid, "modified_at" timestamptz DEFAULT now(), "closed_at" timestamptz NOT NULL, "requested_at" timestamptz, "rejected_at" timestamptz, "rejected_by_user_id" uuid, "status" text NOT NULL DEFAULT 'drafted', "notes" text, "rejection_notes" text, PRIMARY KEY ("id") , UNIQUE ("id")); COMMENT ON TABLE "public"."loans" IS E'All common fields amongst loans go here, and fields specific to that loan type go into their respective join tables.';