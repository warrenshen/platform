CREATE TABLE "public"."company_product_qualifications" ("id" uuid NOT NULL, "company_id" uuid NOT NULL, "qualifying_date" date NOT NULL, "qualifying_product" text NOT NULL, "bank_note" text, "submitting_user_id" uuid NOT NULL, "metadata_info" json NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz, PRIMARY KEY ("id") , FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("submitting_user_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"), UNIQUE ("company_id", "qualifying_date"));COMMENT ON TABLE "public"."company_product_qualifications" IS E'This is used to track historical product qualifications for the CS dashboard';