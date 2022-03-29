ALTER TABLE "public"."transactions" ADD COLUMN "effective_date" date NOT NULL DEFAULT now();
