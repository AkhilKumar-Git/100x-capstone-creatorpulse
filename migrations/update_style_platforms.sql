-- Update style_samples table to support more platforms
-- This will allow 'twitter', 'tiktok', 'youtube', 'blog' in addition to existing platforms

-- First, let's see the current constraint
-- SELECT constraint_name, check_clause 
-- FROM information_schema.check_constraints 
-- WHERE table_name = 'style_samples';

-- Drop the existing check constraint (if it exists)
ALTER TABLE public.style_samples DROP CONSTRAINT IF EXISTS style_samples_platform_check;

-- Add new check constraint with expanded platform options
ALTER TABLE public.style_samples 
ADD CONSTRAINT style_samples_platform_check 
CHECK (platform IN ('x', 'linkedin', 'instagram', 'twitter', 'tiktok', 'youtube', 'blog'));

-- Verify the change
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE table_name = 'style_samples' AND constraint_name = 'style_samples_platform_check';
