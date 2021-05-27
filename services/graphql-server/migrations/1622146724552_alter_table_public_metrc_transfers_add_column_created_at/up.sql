ALTER TABLE "public"."metrc_transfers" ADD COLUMN "created_at" timestamptz NULL DEFAULT now();
