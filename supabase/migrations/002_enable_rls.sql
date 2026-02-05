-- Production-Grade RLS Policies for Clerk Integration
-- Run this in Supabase SQL Editor after configuring Clerk session tokens

-- Ensure RLS is enabled
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can insert own memories" ON memories;
DROP POLICY IF EXISTS "Users can view own memories" ON memories;
DROP POLICY IF EXISTS "Users can update own memories" ON memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON memories;
DROP POLICY IF EXISTS "Temp: Allow authenticated inserts" ON memories;

-- Create policies using JWT 'sub' claim
-- With Clerk's Supabase integration, auth.jwt() contains the Clerk session token

CREATE POLICY "Users can insert own memories"
ON memories
FOR INSERT
WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can view own memories"
ON memories
FOR SELECT
USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update own memories"
ON memories
FOR UPDATE
USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can delete own memories"
ON memories
FOR DELETE
USING (user_id = (auth.jwt() ->> 'sub'));

-- Verify policies are created
SELECT 
  schemaname,
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'memories';
