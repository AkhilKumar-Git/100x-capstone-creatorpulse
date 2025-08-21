-- Migration: Add analysis utility functions
-- Description: Creates functions to manage style analysis data efficiently

-- Function to upsert vocabulary data
CREATE OR REPLACE FUNCTION upsert_user_vocabulary(
    p_user_id UUID,
    p_word TEXT,
    p_frequency INTEGER,
    p_category TEXT DEFAULT 'business'
)
RETURNS UUID AS $$
DECLARE
    result_id UUID;
BEGIN
    INSERT INTO public.style_vocabulary (user_id, word, frequency, category, updated_at)
    VALUES (p_user_id, p_word, p_frequency, p_category, NOW())
    ON CONFLICT (user_id, word) 
    DO UPDATE SET 
        frequency = EXCLUDED.frequency,
        category = EXCLUDED.category,
        updated_at = NOW()
    RETURNING id INTO result_id;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upsert tone analysis data
CREATE OR REPLACE FUNCTION upsert_user_tone_analysis(
    p_user_id UUID,
    p_tone_name TEXT,
    p_percentage INTEGER,
    p_color TEXT,
    p_description TEXT
)
RETURNS UUID AS $$
DECLARE
    result_id UUID;
BEGIN
    INSERT INTO public.style_tone_analysis (user_id, tone_name, percentage, color, description, updated_at)
    VALUES (p_user_id, p_tone_name, p_percentage, p_color, p_description, NOW())
    ON CONFLICT (user_id, tone_name) 
    DO UPDATE SET 
        percentage = EXCLUDED.percentage,
        color = EXCLUDED.color,
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO result_id;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upsert formatting habits
CREATE OR REPLACE FUNCTION upsert_user_formatting_habit(
    p_user_id UUID,
    p_habit_text TEXT,
    p_confidence_score DECIMAL DEFAULT 0.5
)
RETURNS UUID AS $$
DECLARE
    result_id UUID;
BEGIN
    INSERT INTO public.style_formatting_habits (user_id, habit_text, confidence_score, updated_at)
    VALUES (p_user_id, p_habit_text, p_confidence_score, NOW())
    ON CONFLICT (user_id, habit_text) 
    DO UPDATE SET 
        confidence_score = EXCLUDED.confidence_score,
        updated_at = NOW()
    RETURNING id INTO result_id;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update analysis metadata
CREATE OR REPLACE FUNCTION update_analysis_metadata(
    p_user_id UUID,
    p_total_samples INTEGER,
    p_analysis_version TEXT DEFAULT '1.0'
)
RETURNS UUID AS $$
DECLARE
    result_id UUID;
BEGIN
    INSERT INTO public.style_analysis_metadata (user_id, last_analyzed_at, total_samples_analyzed, analysis_version, updated_at)
    VALUES (p_user_id, NOW(), p_total_samples, p_analysis_version, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        last_analyzed_at = NOW(),
        total_samples_analyzed = EXCLUDED.total_samples_analyzed,
        analysis_version = EXCLUDED.analysis_version,
        updated_at = NOW()
    RETURNING id INTO result_id;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's top vocabulary words
CREATE OR REPLACE FUNCTION get_user_vocabulary(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 25
)
RETURNS TABLE (
    word TEXT,
    frequency INTEGER,
    category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sv.word,
        sv.frequency,
        sv.category
    FROM public.style_vocabulary sv
    WHERE sv.user_id = p_user_id
    ORDER BY sv.frequency DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's tone analysis
CREATE OR REPLACE FUNCTION get_user_tone_analysis(p_user_id UUID)
RETURNS TABLE (
    tone_name TEXT,
    percentage INTEGER,
    color TEXT,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sta.tone_name,
        sta.percentage,
        sta.color,
        sta.description
    FROM public.style_tone_analysis sta
    WHERE sta.user_id = p_user_id
    ORDER BY sta.percentage DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's formatting habits
CREATE OR REPLACE FUNCTION get_user_formatting_habits(p_user_id UUID)
RETURNS TABLE (
    habit_text TEXT,
    confidence_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sfh.habit_text,
        sfh.confidence_score
    FROM public.style_formatting_habits sfh
    WHERE sfh.user_id = p_user_id
    ORDER BY sfh.confidence_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if analysis needs refresh
CREATE OR REPLACE FUNCTION should_refresh_analysis(
    p_user_id UUID,
    p_current_sample_count INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    metadata_record RECORD;
BEGIN
    SELECT * INTO metadata_record 
    FROM public.style_analysis_metadata 
    WHERE user_id = p_user_id;
    
    -- If no metadata exists, analysis is needed
    IF NOT FOUND THEN
        RETURN TRUE;
    END IF;
    
    -- If sample count has changed significantly, refresh analysis
    IF ABS(metadata_record.total_samples_analyzed - p_current_sample_count) > 2 THEN
        RETURN TRUE;
    END IF;
    
    -- If analysis is older than 7 days, refresh
    IF metadata_record.last_analyzed_at < (NOW() - INTERVAL '7 days') THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION upsert_user_vocabulary(UUID, TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_user_tone_analysis(UUID, TEXT, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_user_formatting_habit(UUID, TEXT, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION update_analysis_metadata(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_vocabulary(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_tone_analysis(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_formatting_habits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION should_refresh_analysis(UUID, INTEGER) TO authenticated;
