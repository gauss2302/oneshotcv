ALTER TABLE "resumes"
ADD COLUMN IF NOT EXISTS "professional_title" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "polar_customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"polar_customer_id" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "polar_customers_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "polar_customers_polar_customer_id_unique" UNIQUE("polar_customer_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "polar_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"polar_customer_id" text NOT NULL,
	"polar_subscription_id" text NOT NULL,
	"status" text NOT NULL,
	"product_id" text,
	"product_price_id" text,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "polar_subscriptions_polar_subscription_id_unique" UNIQUE("polar_subscription_id")
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "polar_customers" ADD CONSTRAINT "polar_customers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "polar_subscriptions" ADD CONSTRAINT "polar_subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "polar_subscriptions" ADD CONSTRAINT "polar_subscriptions_polar_customer_id_polar_customers_polar_customer_id_fk" FOREIGN KEY ("polar_customer_id") REFERENCES "public"."polar_customers"("polar_customer_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
