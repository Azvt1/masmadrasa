-- Parent phone numbers for Teacher Amr's students

UPDATE students s SET parent_phone = '+61404721813'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Yonos%';

UPDATE students s SET parent_phone = '+61410510287'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Ayden%';

-- Use both name parts to avoid matching Malik Zangana (Fahad's class)
UPDATE students s SET parent_phone = '+61406290404'
FROM profiles p WHERE s.profile_id = p.id
  AND p.full_name ILIKE '%Muhammad%' AND p.full_name ILIKE '%Zangana%';
