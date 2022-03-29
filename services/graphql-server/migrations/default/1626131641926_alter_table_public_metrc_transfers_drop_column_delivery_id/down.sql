ALTER TABLE "public"."metrc_transfers" ADD COLUMN "delivery_id" text;
ALTER TABLE "public"."metrc_transfers" ALTER COLUMN "delivery_id" DROP NOT NULL;
ALTER TABLE "public"."metrc_transfers" ADD CONSTRAINT metrc_transfers_delivery_id_key UNIQUE (delivery_id);
