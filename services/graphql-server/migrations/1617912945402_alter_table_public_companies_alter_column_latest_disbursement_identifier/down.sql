ALTER TABLE "public"."companies" ALTER COLUMN "latest_disbursement_identifier" DROP NOT NULL;
COMMENT ON COLUMN "public"."companies"."latest_disbursement_identifier" IS E'';
