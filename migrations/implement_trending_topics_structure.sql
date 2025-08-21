-- Implement trending topics structure with 5 topics and 10 items each
-- Based on the web search results for optimal trending display

-- Create topics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.topics (
  topic_id SERIAL PRIMARY KEY,
  topic_name VARCHAR(255) NOT NULL,
  topic_description TEXT,
  trending_score DECIMAL(10,2) DEFAULT 0.0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(topic_name, user_id)
);

-- Create trending_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.trending_items (
  item_id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES public.topics(topic_id) ON DELETE CASCADE,
  item_name VARCHAR(500) NOT NULL,
  item_content TEXT,
  trending_score DECIMAL(10,2) DEFAULT 0.0,
  source_type VARCHAR(50),
  source_ref VARCHAR(255),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_topics_user_score ON public.topics(user_id, trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_items_topic_score ON public.trending_items(topic_id, trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_items_user ON public.trending_items(user_id);

-- Create function to get top 5 topics with top 10 items each
CREATE OR REPLACE FUNCTION get_top_trending_topics_with_items(
  p_user_id UUID,
  p_topic_limit INTEGER DEFAULT 5,
  p_item_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  topic_id INTEGER,
  topic_name VARCHAR(255),
  topic_description TEXT,
  trending_score DECIMAL(10,2),
  item_id INTEGER,
  item_name VARCHAR(500),
  item_content TEXT,
  item_trending_score DECIMAL(10,2),
  source_type VARCHAR(50),
  source_ref VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  WITH RankedItems AS (
    SELECT
      ti.topic_id,
      ti.item_id,
      ti.item_name,
      ti.item_content,
      ti.trending_score,
      ti.source_type,
      ti.source_ref,
      RANK() OVER (PARTITION BY ti.topic_id ORDER BY ti.trending_score DESC) AS item_rank
    FROM
      public.trending_items ti
    WHERE
      ti.user_id = p_user_id
  ),
  TopTopics AS (
    SELECT
      t.topic_id,
      t.topic_name,
      t.topic_description,
      t.trending_score
    FROM
      public.topics t
    WHERE
      t.user_id = p_user_id
    ORDER BY
      t.trending_score DESC
    LIMIT p_topic_limit
  )
  SELECT
    tt.topic_id,
    tt.topic_name,
    tt.topic_description,
    tt.trending_score,
    ri.item_id,
    ri.item_name,
    ri.item_content,
    ri.trending_score,
    ri.source_type,
    ri.source_ref
  FROM
    TopTopics tt
  JOIN
    RankedItems ri ON tt.topic_id = ri.topic_id
  WHERE
    ri.item_rank <= p_item_limit
  ORDER BY
    tt.trending_score DESC,
    ri.trending_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically update topic trending scores
CREATE OR REPLACE FUNCTION update_topic_trending_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the topic's trending score based on its items
  UPDATE public.topics 
  SET 
    trending_score = (
      SELECT AVG(trending_score) 
      FROM public.trending_items 
      WHERE topic_id = NEW.topic_id
    ),
    updated_at = NOW()
  WHERE topic_id = NEW.topic_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update topic scores
DROP TRIGGER IF EXISTS trigger_update_topic_score ON public.trending_items;
CREATE TRIGGER trigger_update_topic_score
  AFTER INSERT OR UPDATE OR DELETE ON public.trending_items
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_trending_score();

-- Add RLS policies
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_items ENABLE ROW LEVEL SECURITY;

-- Topics policies
CREATE POLICY "Users can view their own topics" ON public.topics
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own topics" ON public.topics
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own topics" ON public.topics
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own topics" ON public.topics
  FOR DELETE USING (auth.uid()::text = user_id);

-- Trending items policies
CREATE POLICY "Users can view their own trending items" ON public.trending_items
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own trending items" ON public.trending_items
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own trending items" ON public.trending_items
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own trending items" ON public.trending_items
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create function to populate topics from existing trend_items
CREATE OR REPLACE FUNCTION migrate_existing_trend_items()
RETURNS void AS $$
DECLARE
  trend_record RECORD;
  topic_id INTEGER;
BEGIN
  -- Loop through existing trend_items and create topics
  FOR trend_record IN 
    SELECT DISTINCT title, user_id, AVG(score) as avg_score
    FROM public.trend_items 
    WHERE title IS NOT NULL 
    GROUP BY title, user_id
  LOOP
    -- Insert topic
    INSERT INTO public.topics (topic_name, user_id, trending_score)
    VALUES (trend_record.title, trend_record.user_id, trend_record.avg_score)
    ON CONFLICT (topic_name, user_id) DO NOTHING
    RETURNING topic_id INTO topic_id;
    
    -- Get the topic_id if it was inserted
    IF topic_id IS NULL THEN
      SELECT t.topic_id INTO topic_id 
      FROM public.topics t 
      WHERE t.topic_name = trend_record.title AND t.user_id = trend_record.user_id;
    END IF;
    
    -- Insert trending items for this topic
    INSERT INTO public.trending_items (
      topic_id, item_name, item_content, trending_score, 
      source_type, source_ref, user_id
    )
    SELECT 
      topic_id,
      ti.title,
      ti.summary,
      ti.score,
      ti.source_type,
      ti.source_ref,
      ti.user_id
    FROM public.trend_items ti
    WHERE ti.title = trend_record.title AND ti.user_id = trend_record.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE public.topics IS 'Stores trending topics for users';
COMMENT ON TABLE public.trending_items IS 'Stores individual trending items grouped by topics';
COMMENT ON FUNCTION get_top_trending_topics_with_items IS 'Returns top N topics with top M items each for a user';
COMMENT ON FUNCTION update_topic_trending_score IS 'Automatically updates topic trending scores when items change';
COMMENT ON FUNCTION migrate_existing_trend_items IS 'Migrates existing trend_items to the new topics structure';
