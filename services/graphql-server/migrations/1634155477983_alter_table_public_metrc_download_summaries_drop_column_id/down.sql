ALTER TABLE "public"."metrc_download_summaries" ADD COLUMN "id" int4;
ALTER TABLE "public"."metrc_download_summaries" ALTER COLUMN "id" DROP NOT NULL;
ALTER TABLE "public"."metrc_download_summaries" ALTER COLUMN "id" SET DEFAULT nextval('metrc_download_summaries_id_seq'::regclass);
