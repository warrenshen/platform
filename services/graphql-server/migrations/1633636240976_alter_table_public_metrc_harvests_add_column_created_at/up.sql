ALTER TABLE "public"."metrc_harvests" ADD COLUMN "created_at" timestamptz NULL DEFAULT now();
