ALTER TABLE "public"."company_partnership_requests" ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT now();
