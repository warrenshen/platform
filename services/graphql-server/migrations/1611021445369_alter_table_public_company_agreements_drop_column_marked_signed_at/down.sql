ALTER TABLE "public"."company_agreements" ADD COLUMN "marked_signed_at" timestamptz;
ALTER TABLE "public"."company_agreements" ALTER COLUMN "marked_signed_at" DROP NOT NULL;
