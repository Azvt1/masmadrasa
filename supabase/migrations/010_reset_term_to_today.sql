-- Reset active term to start from 8 Sep 2026 and remove all past sessions

-- 1. Update term start date
UPDATE terms
SET start_date = '2026-09-08'
WHERE is_active = true;

-- 2. Delete attendance records tied to past sessions (must go first due to FK)
DELETE FROM attendance_records
WHERE session_id IN (
  SELECT cs.id
  FROM class_sessions cs
  JOIN terms t ON cs.term_id = t.id
  WHERE t.is_active = true
    AND cs.session_date < '2026-09-08'
);

-- 3. Delete past sessions themselves
DELETE FROM class_sessions
WHERE term_id = (SELECT id FROM terms WHERE is_active = true)
  AND session_date < '2026-09-08';
