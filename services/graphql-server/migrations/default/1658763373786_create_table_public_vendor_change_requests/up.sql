CREATE TABLE "public"."vendor_change_requests" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "requesting_user_id" uuid NOT NULL, "requested_vendor_id" uuid NOT NULL, "approved_at" timestamptz, "approved_by_user_id" uuid, "reviewed_by_user_id" uuid, "is_deleted" boolean, "updated_at" timestamptz NOT NULL DEFAULT now(), "created_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz, "status" text NOT NULL, "category" text NOT NULL, "request_info" json NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("requesting_user_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("requested_vendor_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;
