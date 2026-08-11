-- ============================================================
-- Seed 006: Teachers & Students — Term 3, 2026
-- Run this AFTER migrations 001–005
--
-- Default password for ALL accounts: Madrasa2026!
--
-- Teacher login emails:
--   sheikh.abdullah@masmadrasa.com  /  drshady@masmadrasa.com
--   saif@masmadrasa.com  /  amro@masmadrasa.com  /  ahmad@masmadrasa.com
-- ============================================================

DO $$
DECLARE
  t_sheikh  uuid := gen_random_uuid();
  t_shady   uuid := gen_random_uuid();
  t_saif    uuid := gen_random_uuid();
  t_amro    uuid := gen_random_uuid();
  t_ahmad   uuid := gen_random_uuid();

  s_eliaas      uuid := gen_random_uuid();
  s_mohammed_e  uuid := gen_random_uuid();
  s_hud         uuid := gen_random_uuid();
  s_hamzah_s    uuid := gen_random_uuid();
  s_nuh         uuid := gen_random_uuid();
  s_jacob       uuid := gen_random_uuid();
  s_omar_siaj   uuid := gen_random_uuid();
  s_hamza_siaj  uuid := gen_random_uuid();

  s_m_khanja    uuid := gen_random_uuid();
  s_mazen       uuid := gen_random_uuid();
  s_zakaria     uuid := gen_random_uuid();
  s_m_soufi     uuid := gen_random_uuid();
  s_safwan      uuid := gen_random_uuid();
  s_ryan        uuid := gen_random_uuid();
  s_selim       uuid := gen_random_uuid();

  s_abdulrahman   uuid := gen_random_uuid();
  s_mohammad_a    uuid := gen_random_uuid();
  s_mohammad_h    uuid := gen_random_uuid();
  s_abdulmannan   uuid := gen_random_uuid();
  s_ahmad_odeh    uuid := gen_random_uuid();

  s_omar_amro   uuid := gen_random_uuid();
  s_yusuf       uuid := gen_random_uuid();
  s_ayden       uuid := gen_random_uuid();

  s_hamza_soufi   uuid := gen_random_uuid();
  s_adam          uuid := gen_random_uuid();
  s_malham        uuid := gen_random_uuid();
  s_kareem        uuid := gen_random_uuid();
  s_ishaaq        uuid := gen_random_uuid();
  s_jacoub        uuid := gen_random_uuid();
  s_noah          uuid := gen_random_uuid();
  s_jood          uuid := gen_random_uuid();

  v_pwd   text;
  v_term  uuid;
BEGIN
  v_pwd  := crypt('Madrasa2026!', gen_salt('bf'));
  SELECT id INTO v_term FROM terms WHERE is_active = true LIMIT 1;

  -- ── 1. TEACHER AUTH USERS ──
  INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,reauthentication_token,email_change,email_change_token_new,email_change_token_current,email_change_confirm_status,is_super_admin,is_sso_user,is_anonymous) VALUES
    ('00000000-0000-0000-0000-000000000000',t_sheikh,'authenticated','authenticated','sheikh.abdullah@masmadrasa.com',v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',t_shady, 'authenticated','authenticated','drshady@masmadrasa.com',        v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',t_saif,  'authenticated','authenticated','saif@masmadrasa.com',           v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',t_amro,  'authenticated','authenticated','amro@masmadrasa.com',           v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',t_ahmad, 'authenticated','authenticated','ahmad@masmadrasa.com',          v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false);

  INSERT INTO auth.identities (id,provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at) VALUES
    (t_sheikh,'sheikh.abdullah@masmadrasa.com',t_sheikh,jsonb_build_object('sub',t_sheikh::text,'email','sheikh.abdullah@masmadrasa.com'),'email',now(),now(),now()),
    (t_shady, 'drshady@masmadrasa.com',        t_shady, jsonb_build_object('sub',t_shady::text, 'email','drshady@masmadrasa.com'),        'email',now(),now(),now()),
    (t_saif,  'saif@masmadrasa.com',           t_saif,  jsonb_build_object('sub',t_saif::text,  'email','saif@masmadrasa.com'),           'email',now(),now(),now()),
    (t_amro,  'amro@masmadrasa.com',           t_amro,  jsonb_build_object('sub',t_amro::text,  'email','amro@masmadrasa.com'),           'email',now(),now(),now()),
    (t_ahmad, 'ahmad@masmadrasa.com',          t_ahmad, jsonb_build_object('sub',t_ahmad::text, 'email','ahmad@masmadrasa.com'),          'email',now(),now(),now());

  INSERT INTO profiles (id,full_name,role) VALUES
    (t_sheikh,'Sheikh Abdullah','teacher'),
    (t_shady, 'Dr. Shady',     'teacher'),
    (t_saif,  'Saif',          'teacher'),
    (t_amro,  'Amro',          'teacher'),
    (t_ahmad, 'Ahmad',         'teacher');

  -- ── 2. STUDENT AUTH USERS ──
  INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,reauthentication_token,email_change,email_change_token_new,email_change_token_current,email_change_confirm_status,is_super_admin,is_sso_user,is_anonymous) VALUES
    ('00000000-0000-0000-0000-000000000000',s_eliaas,     'authenticated','authenticated','eliaas.alsaadi@students.masmadrasa.com',    v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_mohammed_e, 'authenticated','authenticated','mohammed.e@students.masmadrasa.com',         v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_hud,        'authenticated','authenticated','hud.alchaar@students.masmadrasa.com',        v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_hamzah_s,   'authenticated','authenticated','hamzah.sultan@students.masmadrasa.com',      v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_nuh,        'authenticated','authenticated','nuh.siaj@students.masmadrasa.com',           v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_jacob,      'authenticated','authenticated','jacob.siaj@students.masmadrasa.com',         v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_omar_siaj,  'authenticated','authenticated','omar.siaj@students.masmadrasa.com',          v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_hamza_siaj, 'authenticated','authenticated','hamza.siaj@students.masmadrasa.com',         v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_m_khanja,   'authenticated','authenticated','m.khanja@students.masmadrasa.com',           v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_mazen,      'authenticated','authenticated','mazen@students.masmadrasa.com',              v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_zakaria,    'authenticated','authenticated','zakaria@students.masmadrasa.com',            v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_m_soufi,    'authenticated','authenticated','m.soufi@students.masmadrasa.com',            v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_safwan,     'authenticated','authenticated','safwan@students.masmadrasa.com',             v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_ryan,       'authenticated','authenticated','ryan@students.masmadrasa.com',               v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_selim,      'authenticated','authenticated','selim@students.masmadrasa.com',              v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_abdulrahman,'authenticated','authenticated','abdulrahman@students.masmadrasa.com',        v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_mohammad_a, 'authenticated','authenticated','mohammad.ahmed@students.masmadrasa.com',     v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_mohammad_h, 'authenticated','authenticated','mohammad.hadi@students.masmadrasa.com',      v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_abdulmannan,'authenticated','authenticated','abdulmannan.ahmad@students.masmadrasa.com',  v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_ahmad_odeh, 'authenticated','authenticated','ahmad.odeh@students.masmadrasa.com',         v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_omar_amro,  'authenticated','authenticated','omar.amro@students.masmadrasa.com',          v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_yusuf,      'authenticated','authenticated','yusuf@students.masmadrasa.com',              v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_ayden,      'authenticated','authenticated','ayden@students.masmadrasa.com',              v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_hamza_soufi,'authenticated','authenticated','hamza.soufi@students.masmadrasa.com',        v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_adam,       'authenticated','authenticated','adam.alhariri@students.masmadrasa.com',      v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_malham,     'authenticated','authenticated','malham.turshan@students.masmadrasa.com',     v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_kareem,     'authenticated','authenticated','kareem.alhamdy@students.masmadrasa.com',     v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_ishaaq,     'authenticated','authenticated','ishaaq.fayez@students.masmadrasa.com',       v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_jacoub,     'authenticated','authenticated','jacoub.fayez@students.masmadrasa.com',       v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_noah,       'authenticated','authenticated','noah.firas@students.masmadrasa.com',         v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false),
    ('00000000-0000-0000-0000-000000000000',s_jood,       'authenticated','authenticated','jood.khalaf@students.masmadrasa.com',        v_pwd,now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','','',0,false,false,false);

  INSERT INTO auth.identities (id,provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at) VALUES
    (s_eliaas,     'eliaas.alsaadi@students.masmadrasa.com',    s_eliaas,     jsonb_build_object('sub',s_eliaas::text,     'email','eliaas.alsaadi@students.masmadrasa.com'),    'email',now(),now(),now()),
    (s_mohammed_e, 'mohammed.e@students.masmadrasa.com',         s_mohammed_e, jsonb_build_object('sub',s_mohammed_e::text, 'email','mohammed.e@students.masmadrasa.com'),         'email',now(),now(),now()),
    (s_hud,        'hud.alchaar@students.masmadrasa.com',        s_hud,        jsonb_build_object('sub',s_hud::text,        'email','hud.alchaar@students.masmadrasa.com'),        'email',now(),now(),now()),
    (s_hamzah_s,   'hamzah.sultan@students.masmadrasa.com',      s_hamzah_s,   jsonb_build_object('sub',s_hamzah_s::text,   'email','hamzah.sultan@students.masmadrasa.com'),      'email',now(),now(),now()),
    (s_nuh,        'nuh.siaj@students.masmadrasa.com',           s_nuh,        jsonb_build_object('sub',s_nuh::text,        'email','nuh.siaj@students.masmadrasa.com'),           'email',now(),now(),now()),
    (s_jacob,      'jacob.siaj@students.masmadrasa.com',         s_jacob,      jsonb_build_object('sub',s_jacob::text,      'email','jacob.siaj@students.masmadrasa.com'),         'email',now(),now(),now()),
    (s_omar_siaj,  'omar.siaj@students.masmadrasa.com',          s_omar_siaj,  jsonb_build_object('sub',s_omar_siaj::text,  'email','omar.siaj@students.masmadrasa.com'),          'email',now(),now(),now()),
    (s_hamza_siaj, 'hamza.siaj@students.masmadrasa.com',         s_hamza_siaj, jsonb_build_object('sub',s_hamza_siaj::text, 'email','hamza.siaj@students.masmadrasa.com'),         'email',now(),now(),now()),
    (s_m_khanja,   'm.khanja@students.masmadrasa.com',           s_m_khanja,   jsonb_build_object('sub',s_m_khanja::text,   'email','m.khanja@students.masmadrasa.com'),           'email',now(),now(),now()),
    (s_mazen,      'mazen@students.masmadrasa.com',              s_mazen,      jsonb_build_object('sub',s_mazen::text,      'email','mazen@students.masmadrasa.com'),              'email',now(),now(),now()),
    (s_zakaria,    'zakaria@students.masmadrasa.com',            s_zakaria,    jsonb_build_object('sub',s_zakaria::text,    'email','zakaria@students.masmadrasa.com'),            'email',now(),now(),now()),
    (s_m_soufi,    'm.soufi@students.masmadrasa.com',            s_m_soufi,    jsonb_build_object('sub',s_m_soufi::text,    'email','m.soufi@students.masmadrasa.com'),            'email',now(),now(),now()),
    (s_safwan,     'safwan@students.masmadrasa.com',             s_safwan,     jsonb_build_object('sub',s_safwan::text,     'email','safwan@students.masmadrasa.com'),             'email',now(),now(),now()),
    (s_ryan,       'ryan@students.masmadrasa.com',               s_ryan,       jsonb_build_object('sub',s_ryan::text,       'email','ryan@students.masmadrasa.com'),               'email',now(),now(),now()),
    (s_selim,      'selim@students.masmadrasa.com',              s_selim,      jsonb_build_object('sub',s_selim::text,      'email','selim@students.masmadrasa.com'),              'email',now(),now(),now()),
    (s_abdulrahman,'abdulrahman@students.masmadrasa.com',        s_abdulrahman,jsonb_build_object('sub',s_abdulrahman::text,'email','abdulrahman@students.masmadrasa.com'),        'email',now(),now(),now()),
    (s_mohammad_a, 'mohammad.ahmed@students.masmadrasa.com',     s_mohammad_a, jsonb_build_object('sub',s_mohammad_a::text, 'email','mohammad.ahmed@students.masmadrasa.com'),     'email',now(),now(),now()),
    (s_mohammad_h, 'mohammad.hadi@students.masmadrasa.com',      s_mohammad_h, jsonb_build_object('sub',s_mohammad_h::text, 'email','mohammad.hadi@students.masmadrasa.com'),      'email',now(),now(),now()),
    (s_abdulmannan,'abdulmannan.ahmad@students.masmadrasa.com',  s_abdulmannan,jsonb_build_object('sub',s_abdulmannan::text,'email','abdulmannan.ahmad@students.masmadrasa.com'),  'email',now(),now(),now()),
    (s_ahmad_odeh, 'ahmad.odeh@students.masmadrasa.com',         s_ahmad_odeh, jsonb_build_object('sub',s_ahmad_odeh::text, 'email','ahmad.odeh@students.masmadrasa.com'),         'email',now(),now(),now()),
    (s_omar_amro,  'omar.amro@students.masmadrasa.com',          s_omar_amro,  jsonb_build_object('sub',s_omar_amro::text,  'email','omar.amro@students.masmadrasa.com'),          'email',now(),now(),now()),
    (s_yusuf,      'yusuf@students.masmadrasa.com',              s_yusuf,      jsonb_build_object('sub',s_yusuf::text,      'email','yusuf@students.masmadrasa.com'),              'email',now(),now(),now()),
    (s_ayden,      'ayden@students.masmadrasa.com',              s_ayden,      jsonb_build_object('sub',s_ayden::text,      'email','ayden@students.masmadrasa.com'),              'email',now(),now(),now()),
    (s_hamza_soufi,'hamza.soufi@students.masmadrasa.com',        s_hamza_soufi,jsonb_build_object('sub',s_hamza_soufi::text,'email','hamza.soufi@students.masmadrasa.com'),        'email',now(),now(),now()),
    (s_adam,       'adam.alhariri@students.masmadrasa.com',      s_adam,       jsonb_build_object('sub',s_adam::text,       'email','adam.alhariri@students.masmadrasa.com'),      'email',now(),now(),now()),
    (s_malham,     'malham.turshan@students.masmadrasa.com',     s_malham,     jsonb_build_object('sub',s_malham::text,     'email','malham.turshan@students.masmadrasa.com'),     'email',now(),now(),now()),
    (s_kareem,     'kareem.alhamdy@students.masmadrasa.com',     s_kareem,     jsonb_build_object('sub',s_kareem::text,     'email','kareem.alhamdy@students.masmadrasa.com'),     'email',now(),now(),now()),
    (s_ishaaq,     'ishaaq.fayez@students.masmadrasa.com',       s_ishaaq,     jsonb_build_object('sub',s_ishaaq::text,     'email','ishaaq.fayez@students.masmadrasa.com'),       'email',now(),now(),now()),
    (s_jacoub,     'jacoub.fayez@students.masmadrasa.com',       s_jacoub,     jsonb_build_object('sub',s_jacoub::text,     'email','jacoub.fayez@students.masmadrasa.com'),       'email',now(),now(),now()),
    (s_noah,       'noah.firas@students.masmadrasa.com',         s_noah,       jsonb_build_object('sub',s_noah::text,       'email','noah.firas@students.masmadrasa.com'),         'email',now(),now(),now()),
    (s_jood,       'jood.khalaf@students.masmadrasa.com',        s_jood,       jsonb_build_object('sub',s_jood::text,       'email','jood.khalaf@students.masmadrasa.com'),        'email',now(),now(),now());

  -- ── 3. STUDENT PROFILES ──
  INSERT INTO profiles (id,full_name,role) VALUES
    (s_eliaas,     'Eliaas Al Saadi',   'student'),
    (s_mohammed_e, 'Mohammed E',        'student'),
    (s_hud,        'Hud Alchaar',       'student'),
    (s_hamzah_s,   'Hamzah Sultan',     'student'),
    (s_nuh,        'Nuh Siaj',          'student'),
    (s_jacob,      'Jacob Siaj',        'student'),
    (s_omar_siaj,  'Omar Siaj',         'student'),
    (s_hamza_siaj, 'Hamza Siaj',        'student'),
    (s_m_khanja,   'M. Khanja',         'student'),
    (s_mazen,      'Mazen',             'student'),
    (s_zakaria,    'Zakaria',           'student'),
    (s_m_soufi,    'M Soufi',           'student'),
    (s_safwan,     'Safwan',            'student'),
    (s_ryan,       'Ryan',              'student'),
    (s_selim,      'Selim',             'student'),
    (s_abdulrahman,'Abdulrahman',       'student'),
    (s_mohammad_a, 'Mohammad Ahmed',    'student'),
    (s_mohammad_h, 'Mohammad Hadi',     'student'),
    (s_abdulmannan,'Abdulmannan Ahmad', 'student'),
    (s_ahmad_odeh, 'Ahmad Odeh',        'student'),
    (s_omar_amro,  'Omar',              'student'),
    (s_yusuf,      'Yusuf',             'student'),
    (s_ayden,      'Ayden',             'student'),
    (s_hamza_soufi,'Hamza Soufi',       'student'),
    (s_adam,       'Adam Al-Hariri',    'student'),
    (s_malham,     'Malham Turshan',    'student'),
    (s_kareem,     'Kareem Alhamdy',    'student'),
    (s_ishaaq,     'Ishaaq Fayez',      'student'),
    (s_jacoub,     'Jacoub Fayez',      'student'),
    (s_noah,       'Noah Firas',        'student'),
    (s_jood,       'Jood Khalaf',       'student');

  -- ── 4. STUDENTS TABLE ──
  INSERT INTO students (profile_id,teacher_id,student_type,is_active,enrollment_date) VALUES
    (s_eliaas,     t_sheikh,'quran',true,now()),
    (s_mohammed_e, t_sheikh,'quran',true,now()),
    (s_hud,        t_sheikh,'quran',true,now()),
    (s_hamzah_s,   t_sheikh,'quran',true,now()),
    (s_nuh,        t_sheikh,'quran',true,now()),
    (s_jacob,      t_sheikh,'quran',true,now()),
    (s_omar_siaj,  t_sheikh,'quran',true,now()),
    (s_hamza_siaj, t_sheikh,'quran',true,now()),
    (s_m_khanja,   t_shady, 'quran',true,now()),
    (s_mazen,      t_shady, 'quran',true,now()),
    (s_zakaria,    t_shady, 'quran',true,now()),
    (s_m_soufi,    t_shady, 'quran',true,now()),
    (s_safwan,     t_shady, 'quran',true,now()),
    (s_ryan,       t_shady, 'quran',true,now()),
    (s_selim,      t_shady, 'quran',true,now()),
    (s_abdulrahman,t_saif,  'iqra', true,now()),
    (s_mohammad_a, t_saif,  'iqra', true,now()),
    (s_mohammad_h, t_saif,  'iqra', true,now()),
    (s_abdulmannan,t_saif,  'iqra', true,now()),
    (s_ahmad_odeh, t_saif,  'iqra', true,now()),
    (s_omar_amro,  t_amro,  'iqra', true,now()),
    (s_yusuf,      t_amro,  'iqra', true,now()),
    (s_ayden,      t_amro,  'iqra', true,now()),
    (s_hamza_soufi,t_ahmad, 'iqra', true,now()),
    (s_adam,       t_ahmad, 'iqra', true,now()),
    (s_malham,     t_ahmad, 'iqra', true,now()),
    (s_kareem,     t_ahmad, 'iqra', true,now()),
    (s_ishaaq,     t_ahmad, 'iqra', true,now()),
    (s_jacoub,     t_ahmad, 'iqra', true,now()),
    (s_noah,       t_ahmad, 'iqra', true,now()),
    (s_jood,       t_ahmad, 'iqra', true,now());

  -- ── 5. IQRA PROGRESS (Saif=book3, Amro=book5, Ahmad=book1) ──
  INSERT INTO iqra_progress (student_id,current_book,current_page)
  SELECT s.id,
    CASE s.profile_id
      WHEN s_abdulrahman THEN 3 WHEN s_mohammad_a  THEN 3
      WHEN s_mohammad_h  THEN 3 WHEN s_abdulmannan THEN 3
      WHEN s_ahmad_odeh  THEN 3
      WHEN s_omar_amro   THEN 5 WHEN s_yusuf       THEN 5
      WHEN s_ayden       THEN 5
      ELSE 1
    END, 1
  FROM students s
  WHERE s.profile_id IN (
    s_abdulrahman,s_mohammad_a,s_mohammad_h,s_abdulmannan,s_ahmad_odeh,
    s_omar_amro,s_yusuf,s_ayden,
    s_hamza_soufi,s_adam,s_malham,s_kareem,s_ishaaq,s_jacoub,s_noah,s_jood)
  ON CONFLICT (student_id) DO NOTHING;

  -- ── 6. TERM PAYMENTS (all unpaid) ──
  IF v_term IS NOT NULL THEN
    INSERT INTO term_payments (student_id,term_id,paid)
    SELECT s.id,v_term,false FROM students s
    WHERE s.profile_id IN (
      s_eliaas,s_mohammed_e,s_hud,s_hamzah_s,s_nuh,s_jacob,s_omar_siaj,s_hamza_siaj,
      s_m_khanja,s_mazen,s_zakaria,s_m_soufi,s_safwan,s_ryan,s_selim,
      s_abdulrahman,s_mohammad_a,s_mohammad_h,s_abdulmannan,s_ahmad_odeh,
      s_omar_amro,s_yusuf,s_ayden,
      s_hamza_soufi,s_adam,s_malham,s_kareem,s_ishaaq,s_jacoub,s_noah,s_jood)
    ON CONFLICT (student_id,term_id) DO NOTHING;
  END IF;

END;
$$;
