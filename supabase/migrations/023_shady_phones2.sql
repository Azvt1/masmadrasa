-- Parent phone for Safwan and Ryan
UPDATE students s SET parent_phone = '+61452514752'
FROM profiles p
WHERE s.profile_id = p.id
  AND p.full_name ILIKE ANY(ARRAY['%Safwan%', '%Ryan%']);
