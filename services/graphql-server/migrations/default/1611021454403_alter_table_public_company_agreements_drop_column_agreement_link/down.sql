ALTER TABLE "public"."company_agreements" ADD COLUMN "agreement_link" text;
ALTER TABLE "public"."company_agreements" ALTER COLUMN "agreement_link" DROP NOT NULL;
