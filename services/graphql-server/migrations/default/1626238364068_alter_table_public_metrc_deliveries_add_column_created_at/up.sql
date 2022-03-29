ALTER TABLE "public"."metrc_deliveries" ADD COLUMN "created_at" timestamptz NULL DEFAULT now();
