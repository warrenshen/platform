ALTER TABLE "public"."metrc_deliveries" ADD COLUMN "payor_id" uuid;
ALTER TABLE "public"."metrc_deliveries" ALTER COLUMN "payor_id" DROP NOT NULL;
ALTER TABLE "public"."metrc_deliveries" ADD CONSTRAINT metrc_deliveries_payor_id_fkey FOREIGN KEY (payor_id) REFERENCES "public"."companies" (id) ON DELETE restrict ON UPDATE restrict;
