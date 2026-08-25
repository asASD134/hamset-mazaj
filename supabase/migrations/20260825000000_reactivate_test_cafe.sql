-- The test tenant is a real tenant and must remain available for its owner.
update public.cafes
set is_active = true
where slug = 'test-cafe';
