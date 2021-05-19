CREATE TABLE "public"."invoice_file_type"("value" text NOT NULL, "display_name" text NOT NULL, PRIMARY KEY ("value") , UNIQUE ("value"));
INSERT INTO invoice_file_type (value, display_name) VALUES
    ('invoice', 'Invoice'),
    ('cannabis', 'Cannabis');
