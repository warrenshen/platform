DROP TRIGGER IF EXISTS "set_public_metrc_transfers_updated_at" ON "public"."metrc_transfers";
ALTER TABLE "public"."metrc_transfers" DROP COLUMN "updated_at";
