-- =============================================
-- Pikmin Bloom 飾品圖鑑 - Supabase Database Schema
-- =============================================
-- Run this SQL in Supabase SQL Editor to create the tables
-- https://supabase.com/dashboard/project/YOUR-PROJECT/sql

-- 1. User Profiles Table
-- Stores additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  friend_code TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view all profiles" 
  ON user_profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 2. User Collections Table
-- Stores collection progress as JSONB array
CREATE TABLE IF NOT EXISTS user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  collected_items JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- Policies for user_collections
CREATE POLICY "Users can view own collection" 
  ON user_collections FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own collection" 
  ON user_collections FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collection" 
  ON user_collections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 3. Friend Posts Table (Message Board)
-- Stores friend code posts for the community
CREATE TABLE IF NOT EXISTS friend_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  friend_code TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE friend_posts ENABLE ROW LEVEL SECURITY;

-- Policies for friend_posts
CREATE POLICY "Anyone can view friend posts" 
  ON friend_posts FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create posts" 
  ON friend_posts FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own posts" 
  ON friend_posts FOR DELETE 
  USING (auth.uid() = user_id);

-- 4. Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  
  INSERT INTO public.user_collections (user_id, collected_items)
  VALUES (NEW.id, '[]'::jsonb);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
