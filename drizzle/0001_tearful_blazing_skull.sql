CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"isApproved" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;