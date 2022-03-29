ALTER TABLE "public"."companies" ALTER COLUMN "latest_disbursement_identifier" SET NOT NULL;
COMMENT ON COLUMN "public"."companies"."latest_disbursement_identifier" IS E'The latest disbursement (payment) identifier assigned to loans belonging to this company when an advance is made; increment this value to get a new disbursement identifier for a new payment';
