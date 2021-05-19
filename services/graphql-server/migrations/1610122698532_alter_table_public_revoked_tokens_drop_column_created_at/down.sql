ALTER TABLE "public"."revoked_tokens" ADD COLUMN "created_at" timetz;
ALTER TABLE "public"."revoked_tokens" ALTER COLUMN "created_at" DROP NOT NULL;
ALTER TABLE "public"."revoked_tokens" ALTER COLUMN "created_at" SET DEFAULT now();
