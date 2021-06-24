ALTER TABLE "public"."metrc_packages" ADD COLUMN "package_type" text;
ALTER TABLE "public"."metrc_packages" ALTER COLUMN "package_type" DROP NOT NULL;
