ALTER TABLE "public"."loans" ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT now();
