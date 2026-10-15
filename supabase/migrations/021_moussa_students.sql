-- ============================================================
-- Create Moussa's students (Tariq, Karim, Zain, Mahmoud Soufi)
-- and assign them to Moussa's teacher account
-- ============================================================

DO $$
DECLARE
  t_moussa  uuid;
  s_tariq   uuid := gen_random_uuid();
  s_karim   uuid := gen_random_uuid();
  s_zain    uuid := gen_random_uuid();
  s_mahmoud uuid := gen_random_uuid();
  v_pwd     text;
BEGIN
  v_pwd := crypt('Madrasa2026!', gen_salt('bf'));

  -- Look up Moussa's auth user ID by email
  SELECT id INTO t_moussa FROM auth.users WHERE email = 'moussa@masmadrasa.com' LIMIT 1;

  IF t_moussa IS NULL THEN
    RAISE EXCEPTION 'Moussa account not found — run migration 020 first';
  END IF;

  -- 1. Auth users for students
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, reauthentication_token,
    email_change, email_change_token_new,
    email_change_confirm_status, is_super_admin, is_sso_user, is_anonymous
  ) VALUES
    ('00000000-0000-0000-0000-000000000000', s_tariq,   'authenticated','authenticated','tariq@students.masmadrasa.com',          v_pwd, now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000', s_karim,   'authenticated','authenticated','karim@students.masmadrasa.com',           v_pwd, now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000', s_zain,    'authenticated','authenticated','zain@students.masmadrasa.com',            v_pwd, now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000', s_mahmoud, 'authenticated','authenticated','mahmoud.soufi@students.masmadrasa.com',   v_pwd, now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false);

  -- 2. Auth identities
  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES
    (s_tariq,   'tariq@students.masmadrasa.com',        s_tariq,   jsonb_build_object('sub', s_tariq::text,   'email','tariq@students.masmadrasa.com'),        'email',now(),now(),now()),
    (s_karim,   'karim@students.masmadrasa.com',        s_karim,   jsonb_build_object('sub', s_karim::text,   'email','karim@students.masmadrasa.com'),        'email',now(),now(),now()),
    (s_zain,    'zain@students.masmadrasa.com',         s_zain,    jsonb_build_object('sub', s_zain::text,    'email','zain@students.masmadrasa.com'),         'email',now(),now(),now()),
    (s_mahmoud, 'mahmoud.soufi@students.masmadrasa.com',s_mahmoud, jsonb_build_object('sub', s_mahmoud::text, 'email','mahmoud.soufi@students.masmadrasa.com'),'email',now(),now(),now());

  -- 3. Profiles
  INSERT INTO profiles (id, full_name, role) VALUES
    (s_tariq,   'Tariq',         'student'),
    (s_karim,   'Karim',         'student'),
    (s_zain,    'Zain',          'student'),
    (s_mahmoud, 'Mahmoud Soufi', 'student');

  -- 4. Students table (Iqra class, assigned to Moussa)
  INSERT INTO students (profile_id, teacher_id, student_type, is_active, enrollment_date,
                        parent_phone) VALUES
    (s_tariq,   t_moussa, 'iqra', true, now(), '+61416742805'),
    (s_karim,   t_moussa, 'iqra', true, now(), '+61484349272'),
    (s_zain,    t_moussa, 'iqra', true, now(), '+61478519731'),
    (s_mahmoud, t_moussa, 'iqra', true, now(), '+61433442865');

  -- 5. Iqra progress (start at Book 1, Page 1)
  INSERT INTO iqra_progress (student_id, current_book, current_page)
  SELECT s.id, 1, 1 FROM students s WHERE s.profile_id IN (s_tariq, s_karim, s_zain, s_mahmoud);

END $$;
