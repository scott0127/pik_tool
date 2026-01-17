-- RLS Policy Fix for cell_reports
-- Run this in Supabase SQL Editor

-- 1. Drop the strict policy
DROP POLICY IF EXISTS "Authenticated users can insert reports" ON public.cell_reports;

-- 2. Create a more permissive policy for authenticated users
-- This allows any logged-in user to insert rows.
CREATE POLICY "Authenticated users can insert reports" 
    ON public.cell_reports FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- 3. Verify Select Policy (Optional, ensuring it exists)
DROP POLICY IF EXISTS "Anyone can view cell reports" ON public.cell_reports;
CREATE POLICY "Anyone can view cell reports" 
    ON public.cell_reports FOR SELECT 
    USING (true);
