-- Fix infinite recursion in admins SELECT policy
DROP POLICY IF EXISTS "Admins can view admins list" ON public.admins;

-- Allow users to check if their own UID exists in the admins table
CREATE POLICY "Users can check their own admin status" ON public.admins
    FOR SELECT USING (auth.uid() = user_id);
