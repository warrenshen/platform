CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."metrc_packages"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "type" text NOT NULL, "company_id" uuid NOT NULL, "package_id" text NOT NULL, "package_label" text NOT NULL, "package_type" Text NOT NULL, "product_name" text, "product_category_name" text, "package_payload" json NOT NULL, "last_modified_at" timestamptz NOT NULL, "packaged_date" date NOT NULL, PRIMARY KEY ("id") , UNIQUE ("id"), UNIQUE ("package_id"));