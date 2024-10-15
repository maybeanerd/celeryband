CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"emailHash" varchar NOT NULL,
	CONSTRAINT "user_emailHash_unique" UNIQUE("emailHash")
);
