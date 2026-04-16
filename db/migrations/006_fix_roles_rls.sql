-- Fix RLS policies for roles table
-- Allow public read access to roles (needed for frontend role checking)
CREATE POLICY "roles_public_select" ON public.roles
  FOR SELECT USING (true);
