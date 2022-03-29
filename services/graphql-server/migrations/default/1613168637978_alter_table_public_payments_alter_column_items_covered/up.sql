ALTER TABLE ONLY "public"."payments" ALTER COLUMN "items_covered" SET DEFAULT jsonb_build_object();
