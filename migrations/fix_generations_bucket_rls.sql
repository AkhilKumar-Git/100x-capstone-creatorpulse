-- Fix RLS policies for generations bucket to allow authenticated users to upload

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for generations bucket if they exist
DROP POLICY IF EXISTS "generations_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "generations_authenticated_select" ON storage.objects;
DROP POLICY IF EXISTS "generations_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "generations_authenticated_delete" ON storage.objects;

-- Create policies for generations bucket
-- Allow authenticated users to insert files
CREATE POLICY "generations_authenticated_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'generations');

-- Allow authenticated users to select their own files
CREATE POLICY "generations_authenticated_select" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'generations');

-- Allow authenticated users to update their own files
CREATE POLICY "generations_authenticated_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'generations')
WITH CHECK (bucket_id = 'generations');

-- Allow authenticated users to delete their own files
CREATE POLICY "generations_authenticated_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'generations');

-- Also make sure the bucket exists and has the right settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generations',
  'generations',
  true,
  52428800,  -- 50MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
