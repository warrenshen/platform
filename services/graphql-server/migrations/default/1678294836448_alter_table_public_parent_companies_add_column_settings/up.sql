ALTER TABLE "public"."parent_companies" ADD COLUMN "settings" JSONB NOT NULL DEFAULT jsonb_build_object();
