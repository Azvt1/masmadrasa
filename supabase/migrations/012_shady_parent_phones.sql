-- Parent phone numbers for Dr Shady's students
-- AU mobile format 04XX XXX XXX → international +614XX XXX XXX

UPDATE students s SET parent_phone = '+61402665482'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Khanja%';

UPDATE students s SET parent_phone = '+61406290404'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Mazen%';

UPDATE students s SET parent_phone = '+61478519731'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Zakaria%';

UPDATE students s SET parent_phone = '+61433442865'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Soufi%';

UPDATE students s SET parent_phone = '+61450506286'
FROM profiles p WHERE s.profile_id = p.id AND p.full_name ILIKE '%Selim%';

-- Safwan and Ryan: no number yet (leave NULL)
