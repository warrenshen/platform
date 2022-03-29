ALTER TABLE "public"."contracts" ADD COLUMN "modified_at" timestamptz NOT NULL DEFAULT now();
