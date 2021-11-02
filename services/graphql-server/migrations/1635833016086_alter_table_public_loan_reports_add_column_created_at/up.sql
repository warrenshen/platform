ALTER TABLE "public"."loan_reports" ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT now();
