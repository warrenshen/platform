ALTER TABLE "public"."payments" ADD COLUMN "created_at" timestamptz NULL DEFAULT now();
