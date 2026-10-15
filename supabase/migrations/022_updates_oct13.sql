-- ============================================================
-- Oct 13 updates:
-- 1. Rename M. Khanja → Mohammed El-khawaga
-- 2. Add Umran Ajib to Ahmad's class (Iqra)
-- 3. Move Jood Khalaf to Book 3 + reassign to Saif's class
-- ============================================================

DO $$
DECLARE
  t_saif    uuid;
  t_ahmad   uuid;
  s_umran   uuid := gen_random_uuid();
  v_pwd     text;
BEGIN
  v_pwd := crypt('Madrasa2026!', gen_salt('bf'));

  -- Look up teacher IDs by email
  SELECT id INTO t_saif  FROM auth.users WHERE email = 'saif@masmadrasa.com'  LIMIT 1;
  SELECT id INTO t_ahmad FROM auth.users WHERE email = 'ahmad@masmadrasa.com' LIMIT 1;

  -- 1. Rename M. Khanja
  UPDATE profiles SET full_name = 'Mohammed El-khawaga' WHERE full_name = 'M. Khanja';

  -- 2. Add Umran Ajib to Ahmad's class
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, reauthentication_token,
    email_change, email_change_token_new,
    email_change_confirm_status, is_super_admin, is_sso_user, is_anonymous
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', s_umran, 'authenticated','authenticated',
    'umran.ajib@students.masmadrasa.com', v_pwd, now(),
    '{"provider":"email","providers":["email"]}','{}',
    now(),now(),'','','','','',0,false,false,false
  );

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES (
    s_umran, 'umran.ajib@students.masmadrasa.com', s_umran,
    jsonb_build_object('sub', s_umran::text, 'email', 'umran.ajib@students.masmadrasa.com'),
    'email', now(), now(), now()
  );

  INSERT INTO profiles (id, full_name, role) VALUES (s_umran, 'Umran Ajib', 'student');

  INSERT INTO students (profile_id, teacher_id, student_type, is_active, enrollment_date)
  VALUES (s_umran, t_ahmad, 'iqra', true, now());

  INSERT INTO iqra_progress (student_id, current_book, current_page)
  SELECT s.id, 1, 1 FROM students s WHERE s.profile_id = s_umran;

  -- 3a. Reassign Jood Khalaf to Saif's class
  UPDATE students s SET teacher_id = t_saif
  FROM profiles p
  WHERE s.profile_id = p.id AND p.full_name = 'Jood Khalaf';

  -- 3b. Move Jood to Iqra Book 3
  UPDATE iqra_progress ip SET current_book = 3, current_page = 1
  FROM students s
  JOIN profiles p ON s.profile_id = p.id
  WHERE ip.student_id = s.id AND p.full_name = 'Jood Khalaf';

END $$;
