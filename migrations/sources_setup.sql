-- Sources Table Setup for CreatorPulse
-- Run this in your Supabase SQL Editor

-- 1. Create sources table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('x', 'youtube', 'rss', 'blog')),
  handle TEXT,
  url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
-- Users can view their own sources
CREATE POLICY "Users can view own sources" ON public.sources
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own sources
CREATE POLICY "Users can insert own sources" ON public.sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sources
CREATE POLICY "Users can update own sources" ON public.sources
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own sources
CREATE POLICY "Users can delete own sources" ON public.sources
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create unique index to prevent duplicates per user
-- This ensures a user can't have duplicate sources of the same type with same handle/url
CREATE UNIQUE INDEX IF NOT EXISTS sources_user_type_key 
ON public.sources(user_id, type, COALESCE(handle, ''), COALESCE(url, ''));

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sources_user_id ON public.sources(user_id);
CREATE INDEX IF NOT EXISTS idx_sources_type ON public.sources(type);
CREATE INDEX IF NOT EXISTS idx_sources_active ON public.sources(active);
CREATE INDEX IF NOT EXISTS idx_sources_created_at ON public.sources(created_at);

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.sources TO anon, authenticated;

-- 7. Verify the setup
SELECT 'Sources table setup complete!' as status;
SELECT table_name, row_security FROM information_schema.tables 
WHERE table_name = 'sources';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'sources';

-- Check unique index
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename = 'sources' AND indexname = 'sources_user_type_key';
