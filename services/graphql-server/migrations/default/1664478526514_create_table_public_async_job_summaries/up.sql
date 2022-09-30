CREATE TABLE "public"."async_job_summaries" ("id" uuid NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz, "metadata_info" json NOT NULL, "name" text NOT NULL, "date" date NOT NULL, PRIMARY KEY ("id") , UNIQUE ("id"));
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
CREATE TRIGGER "set_public_async_job_summaries_updated_at"
BEFORE UPDATE ON "public"."async_job_summaries"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_async_job_summaries_updated_at" ON "public"."async_job_summaries" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
