-- ============================================================
-- Create teacher accounts for Fahad and Moussa
-- + reassign their students to them
-- ============================================================

DO $$
DECLARE
  t_fahad  uuid := gen_random_uuid();
  t_moussa uuid := gen_random_uuid();
  v_pwd    text;
BEGIN
  v_pwd := crypt('Madrasa2026!', gen_salt('bf'));

  -- 1. Auth users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, reauthentication_token,
    email_change, email_change_token_new, email_change_token_current,
    email_change_confirm_status, is_super_admin, is_sso_user, is_anonymous
  ) VALUES
    ('00000000-0000-0000-0000-000000000000', t_fahad,  'authenticated','authenticated',
     'fahad@masmadrasa.com',  v_pwd, now(),
     '{"provider":"email","providers":["email"]}','{}',
     now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000', t_moussa, 'authenticated','authenticated',
     'moussa@masmadrasa.com', v_pwd, now(),
     '{"provider":"email","providers":["email"]}','{}',
     now(),now(),'','','','','',0,false,false,false);

  -- 2. Auth identities
  INSERT INTO auth.identities (id, user_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
  VALUES
    (t_fahad,  t_fahad,  jsonb_build_object('sub', t_fahad::text,  'email','fahad@masmadrasa.com'),  'email', now(),now(),now()),
    (t_moussa, t_moussa, jsonb_build_object('sub', t_moussa::text, 'email','moussa@masmadrasa.com'), 'email', now(),now(),now());

  -- 3. Public profiles with role = teacher
  INSERT INTO profiles (id, full_name, role)
  VALUES
    (t_fahad,  'Fahad',  'teacher'),
    (t_moussa, 'Moussa', 'teacher');

  -- 4. Reassign Fahad's students (Abdulrahman, Abdulmannan, Ahmad Odeh, Akram, Koujan, Zangana)
  UPDATE students s SET teacher_id = t_fahad
  FROM profiles p
  WHERE s.profile_id = p.id
    AND p.full_name ILIKE ANY(ARRAY['%Abdulrahman%','%Abdulmannan%','%Odeh%','%Akram%','%Koujan%','%Zangana%']);

  -- 5. Reassign Moussa's students (Tariq, Mahmoud Soufi, Karim, Zain)
  UPDATE students s SET teacher_id = t_moussa
  FROM profiles p
  WHERE s.profile_id = p.id
    AND p.full_name ILIKE ANY(ARRAY['%Tariq%','%Karim%','%Zain%']);

  -- Mahmoud Soufi specifically (avoid matching other Soufis)
  UPDATE students s SET teacher_id = t_moussa
  FROM profiles p
  WHERE s.profile_id = p.id
    AND p.full_name ILIKE '%Mahmoud%'
    AND p.full_name ILIKE '%Soufi%';

END $$;
