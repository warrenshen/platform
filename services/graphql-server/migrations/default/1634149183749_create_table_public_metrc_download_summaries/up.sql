CREATE TABLE "public"."metrc_download_summaries"("id" serial NOT NULL, "company_id" uuid NOT NULL, "metrc_api_key_id" uuid NOT NULL, "license_number" text NOT NULL, "date" date NOT NULL, "status" text NOT NULL, "harvests_status" text NOT NULL, "packages_status" text NOT NULL, "plant_batches_status" text NOT NULL, "plants_status" text NOT NULL, "sales_status" text NOT NULL, "transfers_status" text NOT NULL, "retry_payload" json NOT NULL, "err_details" json NOT NULL, "num_retries" integer NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("metrc_api_key_id") REFERENCES "public"."metrc_api_keys"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"), UNIQUE ("company_id", "metrc_api_key_id", "license_number", "date")); COMMENT ON TABLE "public"."metrc_download_summaries" IS E'Structured results of how a download ';
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_metrc_download_summaries_updated_at"
BEFORE UPDATE ON "public"."metrc_download_summaries"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_metrc_download_summaries_updated_at" ON "public"."metrc_download_summaries" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
