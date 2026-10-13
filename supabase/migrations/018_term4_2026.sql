-- ============================================================
-- Term 4 2026
-- Tue 13 Oct → Thu 17 Dec 2026 (Tuesdays + Thursdays only)
-- ============================================================

-- 1. Rename old term so it shows nicely in tabs
UPDATE terms
SET name = 'Term 3 2026'
WHERE is_active = true;

-- 2. Deactivate old term
UPDATE terms SET is_active = false;

-- 3. Insert Term 4 2026
INSERT INTO terms (id, name, start_date, end_date, is_active)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000004',
  'Term 4 2026',
  '2026-10-13',
  '2026-12-17',
  true
);

-- 4. Generate all Tuesday + Thursday sessions for Term 4
INSERT INTO class_sessions (session_date, day_of_week, term_id)
SELECT
  d::date,
  CASE EXTRACT(dow FROM d)
    WHEN 2 THEN 'tuesday'::class_day
    WHEN 4 THEN 'thursday'::class_day
  END,
  'a1b2c3d4-0000-0000-0000-000000000004'
FROM generate_series(
  '2026-10-13'::date,
  '2026-12-17'::date,
  '1 day'::interval
) d
WHERE EXTRACT(dow FROM d) IN (2, 4);
