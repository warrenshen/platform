ALTER TABLE "public"."payments" ADD COLUMN "applied_at" timestamptz;
ALTER TABLE "public"."payments" ALTER COLUMN "applied_at" DROP NOT NULL;
COMMENT ON COLUMN "public"."payments"."applied_at" IS E'TODO: remove in favor of settled_at naming convention';
