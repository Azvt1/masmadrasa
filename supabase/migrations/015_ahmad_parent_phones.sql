-- Parent phone numbers for Teacher Ahmad's students

-- Both parts to avoid matching M Soufi (Dr Shady's class)
UPDATE students s SET parent_phone = '+61433442865'
FROM profiles p WHERE s.profile_id = p.id
  AND p.full_name ILIKE '%Hamza%' AND p.full_name ILIKE '%Soufi%';

UPDATE students s SET parent_phone = '+61424861309'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Hariri%';

UPDATE students s SET parent_phone = '+61406931257'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Noah%';

-- Both parts to avoid matching Adam Al-Hariri
UPDATE students s SET parent_phone = '+61414909526'
FROM profiles p WHERE s.profile_id = p.id
  AND p.full_name ILIKE '%Adam%' AND p.full_name ILIKE '%Uda%';
