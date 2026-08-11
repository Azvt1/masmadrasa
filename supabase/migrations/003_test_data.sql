-- ============================================================
-- Test data — two past sessions with sample attendance
-- Run in Supabase SQL Editor, then delete when done testing
-- ============================================================

-- 1. Insert two past sessions (Jul 28 = Tuesday, Jul 30 = Thursday)
INSERT INTO class_sessions (session_date, day_of_week, term_id)
VALUES
  ('2026-07-28', 'tuesday',  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('2026-07-30', 'thursday', 'a1b2c3d4-0000-0000-0000-000000000001')
ON CONFLICT (session_date) DO NOTHING;


-- 2. Insert varied attendance records
--    Odd-numbered students  → present Jul 28, ABSENT Jul 30  (50% → RED)
--    Even-numbered students → present Jul 28, LATE   Jul 30  (100% → GREEN)
WITH
  sessions AS (
    SELECT id, session_date
    FROM class_sessions
    WHERE session_date IN ('2026-07-28', '2026-07-30')
  ),
  numbered_students AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY enrollment_date, id) AS rn
    FROM students
    WHERE is_active = true
  )
INSERT INTO attendance_records (session_id, student_id, status, notes)
SELECT
  sess.id,
  ns.id,
  CASE
    WHEN sess.session_date = '2026-07-28'               THEN 'present'
    WHEN sess.session_date = '2026-07-30' AND ns.rn % 2 = 1 THEN 'absent'
    WHEN sess.session_date = '2026-07-30' AND ns.rn % 2 = 0 THEN 'late'
  END::attendance_status,
  CASE
    WHEN sess.session_date = '2026-07-30' AND ns.rn % 2 = 1 THEN 'Did not show up'
    WHEN sess.session_date = '2026-07-30' AND ns.rn % 2 = 0 THEN 'Was 10 minutes late'
    ELSE NULL
  END
FROM sessions sess
CROSS JOIN numbered_students ns
ON CONFLICT (session_id, student_id) DO NOTHING;
