-- ============================================================
-- CLEANUP — Remove all test teachers, students, and their data
-- Keeps: admin account, terms, class_sessions
-- Run in Supabase SQL Editor BEFORE running the seed script
-- ============================================================

DO $$
DECLARE
  admin_ids uuid[];
BEGIN
  -- Identify admin user IDs (keep these)
  SELECT array_agg(id) INTO admin_ids
  FROM profiles
  WHERE role = 'admin';

  -- 1. Dependent records (delete first to avoid FK violations)
  DELETE FROM attendance_records
  WHERE student_id IN (SELECT id FROM students);

  DELETE FROM homework_assignments
  WHERE student_id IN (SELECT id FROM students);

  DELETE FROM homework
  WHERE teacher_id IN (SELECT id FROM profiles WHERE role = 'teacher');

  DELETE FROM iqra_progress
  WHERE student_id IN (SELECT id FROM students);

  DELETE FROM quran_progress
  WHERE student_id IN (SELECT id FROM students);

  DELETE FROM progress_snapshots
  WHERE student_id IN (SELECT id FROM students);

  -- term_payments (may not exist yet — safe to ignore if it errors)
  BEGIN
    DELETE FROM term_payments
    WHERE student_id IN (SELECT id FROM students);
  EXCEPTION WHEN undefined_table THEN
    -- table doesn't exist yet, that's fine
  END;

  -- library_files (keep files uploaded by admin)
  DELETE FROM library_files
  WHERE teacher_id NOT IN (SELECT unnest(admin_ids))
     OR teacher_id IS NULL;

  -- student_notes (if table exists)
  BEGIN
    DELETE FROM student_notes;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- 2. Students table
  DELETE FROM students;

  -- 3. Non-admin profiles
  DELETE FROM profiles
  WHERE role IN ('teacher', 'student');

  -- 4. Non-admin auth users (cascade handles identities)
  DELETE FROM auth.users
  WHERE id NOT IN (SELECT unnest(admin_ids));

END;
$$;
