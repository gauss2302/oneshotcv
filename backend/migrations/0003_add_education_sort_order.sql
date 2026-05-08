-- Add sort_order to education table so drag-reorder in the editor persists.
-- Mirrors the existing experience.sort_order and skills.sort_order columns.
-- Safe to re-run: IF NOT EXISTS guards.
ALTER TABLE "education" ADD COLUMN IF NOT EXISTS "sort_order" integer;

-- Backfill existing rows. We use ctid (Postgres' internal physical row id)
-- as a stable proxy for insertion order within each resume, so existing
-- education entries keep their current display order after the migration.
WITH ranked AS (
  SELECT id,
         row_number() OVER (PARTITION BY resume_id ORDER BY ctid) - 1 AS rn
  FROM "education"
  WHERE sort_order IS NULL
)
UPDATE "education"
SET sort_order = ranked.rn
FROM ranked
WHERE "education".id = ranked.id;
