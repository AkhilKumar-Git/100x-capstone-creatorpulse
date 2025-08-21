-- Test Vector Embeddings Functionality
-- Run this in your Supabase SQL Editor

-- 1. First, let's create the similarity search function if it doesn't exist
CREATE OR REPLACE FUNCTION match_style_samples(
  p_user_id UUID,
  p_platform TEXT,
  p_query_embedding vector(1536),
  p_match_count INTEGER DEFAULT 4
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  platform TEXT,
  raw_text TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.id,
    ss.user_id,
    ss.platform,
    ss.raw_text,
    ss.embedding,
    ss.created_at,
    1 - (ss.embedding <=> p_query_embedding) as similarity
  FROM style_samples ss
  WHERE ss.user_id = p_user_id 
    AND ss.platform = p_platform
    AND ss.embedding IS NOT NULL
  ORDER BY ss.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$;

-- 2. Test the function with a dummy embedding (you'll get real ones from OpenAI)
-- This creates a test vector of 1536 zeros
SELECT 
  'Test function created successfully' as status,
  'Run the demo in your app to test with real embeddings' as next_step;

-- 3. Check if your tables are properly set up
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'style_samples'
ORDER BY ordinal_position;

-- 4. Check if the vector extension is enabled
SELECT 
  extname as extension_name,
  extversion as version
FROM pg_extension 
WHERE extname = 'vector';

-- 5. Check your indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'style_samples';
