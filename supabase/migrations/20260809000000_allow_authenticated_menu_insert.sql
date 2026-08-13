-- Allow authenticated users to insert into the menu table as well as anonymous users.
ALTER POLICY menu_insert ON public.menu TO public;
