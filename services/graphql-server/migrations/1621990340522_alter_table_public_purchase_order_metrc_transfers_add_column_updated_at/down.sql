DROP TRIGGER IF EXISTS "set_public_purchase_order_metrc_transfers_updated_at" ON "public"."purchase_order_metrc_transfers";
ALTER TABLE "public"."purchase_order_metrc_transfers" DROP COLUMN "updated_at";
