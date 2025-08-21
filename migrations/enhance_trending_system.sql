-- Enhance trending system with metrics and better source tracking
-- Run this migration to add the necessary columns for the enhanced trending system

-- Add metrics columns to trend_items table
ALTER TABLE public.trend_items 
ADD COLUMN IF NOT EXISTS engagement_rate DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS velocity_score DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS reach_multiplier DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS mentions_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sentiment_score DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS trending_duration INTEGER DEFAULT 1;

-- Add source tracking columns
ALTER TABLE public.trend_items 
ADD COLUMN IF NOT EXISTS contributing_sources TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS content_sources JSONB DEFAULT '{}';

-- Create index for better performance on trending queries
CREATE INDEX IF NOT EXISTS idx_trend_items_user_score_metrics 
ON public.trend_items(user_id, score DESC, engagement_rate DESC, velocity_score DESC);

-- Create index for source-based queries
CREATE INDEX IF NOT EXISTS idx_trend_items_contributing_sources 
ON public.trend_items USING GIN(contributing_sources);

-- Add RLS policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trend_items' 
        AND policyname = 'Users can view their own trend items'
    ) THEN
        CREATE POLICY "Users can view their own trend items" ON public.trend_items
            FOR SELECT USING (auth.uid()::text = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trend_items' 
        AND policyname = 'Users can insert their own trend items'
    ) THEN
        CREATE POLICY "Users can insert their own trend items" ON public.trend_items
            FOR INSERT WITH CHECK (auth.uid()::text = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trend_items' 
        AND policyname = 'Users can update their own trend items'
    ) THEN
        CREATE POLICY "Users can update their own trend items" ON public.trend_items
            FOR UPDATE USING (auth.uid()::text = user_id);
    END IF;
END $$;

-- Create function to calculate momentum score based on metrics
CREATE OR REPLACE FUNCTION calculate_momentum_score(
    p_engagement_rate DECIMAL,
    p_velocity_score DECIMAL,
    p_reach_multiplier DECIMAL,
    p_mentions_count INTEGER,
    p_sentiment_score DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    -- Weighted formula for momentum score
    RETURN (
        p_engagement_rate * 0.3 +
        p_velocity_score * 0.25 +
        p_reach_multiplier * 0.2 +
        LEAST(p_mentions_count * 2, 20) * 0.15 +
        p_sentiment_score * 0.1
    );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update momentum score when metrics change
CREATE OR REPLACE FUNCTION update_momentum_score_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.score = calculate_momentum_score(
        NEW.engagement_rate,
        NEW.velocity_score,
        NEW.reach_multiplier,
        NEW.mentions_count,
        NEW.sentiment_score
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trend_items_momentum_score_trigger'
    ) THEN
        CREATE TRIGGER trend_items_momentum_score_trigger
            BEFORE INSERT OR UPDATE ON public.trend_items
            FOR EACH ROW
            EXECUTE FUNCTION update_momentum_score_trigger();
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN public.trend_items.engagement_rate IS 'Engagement rate percentage (0-100)';
COMMENT ON COLUMN public.trend_items.velocity_score IS 'Velocity score indicating trend speed (0-100)';
COMMENT ON COLUMN public.trend_items.reach_multiplier IS 'Reach multiplier for content distribution (0-100)';
COMMENT ON COLUMN public.trend_items.mentions_count IS 'Number of times this topic was mentioned';
COMMENT ON COLUMN public.trend_items.sentiment_score IS 'Sentiment score from -1 to 1';
COMMENT ON COLUMN public.trend_items.trending_duration IS 'Duration in days this topic has been trending';
COMMENT ON COLUMN public.trend_items.contributing_sources IS 'Array of source IDs that contributed to this trend';
COMMENT ON COLUMN public.trend_items.content_sources IS 'JSON object with detailed source information';

COMMENT ON FUNCTION calculate_momentum_score IS 'Calculates momentum score based on various trending metrics';
COMMENT ON FUNCTION update_momentum_score_trigger IS 'Automatically updates momentum score when metrics change';
