-- Parent phone numbers for Teacher Moussa's students

UPDATE students s SET parent_phone = '+61416742805'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Tariq%';

-- Both parts to avoid matching other Soufis
UPDATE students s SET parent_phone = '+61433442865'
FROM profiles p WHERE s.profile_id = p.id
  AND p.full_name ILIKE '%Mahmoud%' AND p.full_name ILIKE '%Soufi%';

UPDATE students s SET parent_phone = '+61484349272'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Karim%';

UPDATE students s SET parent_phone = '+61478519731'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Zain%';
