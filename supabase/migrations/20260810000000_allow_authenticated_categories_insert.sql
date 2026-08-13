-- Allow both anon and authenticated users to insert into public.categories
ALTER POLICY categories_insert ON public.categories TO anon, authenticated;
