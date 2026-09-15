-- Parent phone numbers for Fahad's students
-- AU mobile format 04XX XXX XXX → international +614XX XXX XXX

UPDATE students s SET parent_phone = '+61403511206'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Abdulrahman%';

UPDATE students s SET parent_phone = '+61430357631'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Abdulmannan%';

UPDATE students s SET parent_phone = '+61432797582'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Odeh%';

UPDATE students s SET parent_phone = '+61422111912'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Akram%';

UPDATE students s SET parent_phone = '+61478519731'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Koujan%';

UPDATE students s SET parent_phone = '+61406290404'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Zangana%';
