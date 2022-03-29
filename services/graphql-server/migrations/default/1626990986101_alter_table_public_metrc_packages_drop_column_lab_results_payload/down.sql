ALTER TABLE "public"."metrc_packages" ADD COLUMN "lab_results_payload" json;
ALTER TABLE "public"."metrc_packages" ALTER COLUMN "lab_results_payload" DROP NOT NULL;
