-- Migration: Create style analysis tables
-- Description: Creates tables to store pre-computed analysis data to avoid repeated API calls

-- Create style_vocabulary table to store word frequency analysis
CREATE TABLE IF NOT EXISTS public.style_vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    frequency INTEGER NOT NULL DEFAULT 1,
    category TEXT CHECK (category IN ('action', 'emotion', 'business', 'casual', 'technical')) DEFAULT 'business',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique words per user
    UNIQUE(user_id, word)
);

-- Create style_tone_analysis table to store tone analysis results
CREATE TABLE IF NOT EXISTS public.style_tone_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tone_name TEXT NOT NULL,
    percentage INTEGER NOT NULL DEFAULT 0,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique tones per user
    UNIQUE(user_id, tone_name)
);

-- Create style_formatting_habits table to store formatting patterns
CREATE TABLE IF NOT EXISTS public.style_formatting_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_text TEXT NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0 to 1.0
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique habits per user
    UNIQUE(user_id, habit_text)
);

-- Create style_analysis_metadata table to track when analysis was last updated
CREATE TABLE IF NOT EXISTS public.style_analysis_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    total_samples_analyzed INTEGER DEFAULT 0,
    analysis_version TEXT DEFAULT '1.0',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One metadata record per user
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_style_vocabulary_user_id ON public.style_vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_style_vocabulary_frequency ON public.style_vocabulary(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_style_vocabulary_category ON public.style_vocabulary(category);

CREATE INDEX IF NOT EXISTS idx_style_tone_analysis_user_id ON public.style_tone_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_style_tone_analysis_percentage ON public.style_tone_analysis(percentage DESC);

CREATE INDEX IF NOT EXISTS idx_style_formatting_habits_user_id ON public.style_formatting_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_style_formatting_habits_confidence ON public.style_formatting_habits(confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_style_analysis_metadata_user_id ON public.style_analysis_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_style_analysis_metadata_last_analyzed ON public.style_analysis_metadata(last_analyzed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.style_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_tone_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_formatting_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_analysis_metadata ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own vocabulary" ON public.style_vocabulary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabulary" ON public.style_vocabulary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary" ON public.style_vocabulary
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabulary" ON public.style_vocabulary
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own tone analysis" ON public.style_tone_analysis
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tone analysis" ON public.style_tone_analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tone analysis" ON public.style_tone_analysis
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tone analysis" ON public.style_tone_analysis
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own formatting habits" ON public.style_formatting_habits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own formatting habits" ON public.style_formatting_habits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own formatting habits" ON public.style_formatting_habits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own formatting habits" ON public.style_formatting_habits
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own analysis metadata" ON public.style_analysis_metadata
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis metadata" ON public.style_analysis_metadata
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis metadata" ON public.style_analysis_metadata
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis metadata" ON public.style_analysis_metadata
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.style_vocabulary TO anon, authenticated;
GRANT ALL ON public.style_tone_analysis TO anon, authenticated;
GRANT ALL ON public.style_formatting_habits TO anon, authenticated;
GRANT ALL ON public.style_analysis_metadata TO anon, authenticated;
