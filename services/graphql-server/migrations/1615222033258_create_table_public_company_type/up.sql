CREATE TABLE "public"."company_type"("value" text NOT NULL, PRIMARY KEY ("value") , UNIQUE ("value"));

INSERT INTO "public"."company_type" (value) VALUES
    ('customer'),
    ('vendor'),
    ('payor');
