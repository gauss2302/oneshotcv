-- Add has_completed_onboarding to user table (custom field for Better Auth user schema)
-- Safe to run: IF NOT EXISTS prevents error if column already exists (e.g. from db:push)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "has_completed_onboarding" boolean DEFAULT false NOT NULL;
