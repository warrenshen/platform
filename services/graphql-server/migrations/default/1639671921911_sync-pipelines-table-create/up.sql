CREATE TABLE IF NOT EXISTS "public"."sync_pipelines"(
	"id" uuid NOT NULL DEFAULT gen_random_uuid(), 
	"name" text NOT NULL, 
	"created_at" timestamptz NOT NULL DEFAULT now(), 
	"updated_at" timestamptz NOT NULL DEFAULT now(),
	"internal_state" json NOT NULL,
	"params" json NOT NULL,
	"status" text NOT NULL,
	PRIMARY KEY ("id"),
	UNIQUE ("id")
);