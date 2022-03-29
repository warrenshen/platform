ALTER TABLE "public"."companies" ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT now();
