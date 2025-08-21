"use client";

import { sbClient } from "@/lib/supabase/client";
import type { WordData, ToneData } from "./analysis";

const supabase = sbClient();

export interface StoredAnalysisData {
  vocabulary: WordData[];
  toneAnalysis: ToneData[];
  formattingHabits: string[];
  lastAnalyzed: Date;
  sampleCount: number;
}

/**
 * Test database connection and permissions
 */
export async function testDatabaseConnection(): Promise<void> {
  try {
    console.log('Testing database connection...');
    
    const { data: user } = await supabase.auth.getUser();
    console.log('User auth status:', !!user.user?.id);
    
    if (user.user?.id) {
      // Test a simple query
      const { data, error } = await supabase
        .from('style_vocabulary')
        .select('id')
        .limit(1);
      
      console.log('Test query result:', { data, error });
    }
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
}

/**
 * Check if the required tables exist, create them if they don't
 */
export async function ensureTablesExist(): Promise<boolean> {
  try {
    console.log('Checking if analysis tables exist...');
    
    // Try to query each table to see if they exist
    const { error: vocabCheck } = await supabase
      .from('style_vocabulary')
      .select('id')
      .limit(1);
    
    const { error: toneCheck } = await supabase
      .from('style_tone_analysis')
      .select('id')
      .limit(1);
    
    const { error: habitsCheck } = await supabase
      .from('style_formatting_habits')
      .select('id')
      .limit(1);
    
    const { error: metadataCheck } = await supabase
      .from('style_analysis_metadata')
      .select('id')
      .limit(1);
    
    // If any table doesn't exist, we'll get a relation error
    const tablesExist = !vocabCheck && !toneCheck && !habitsCheck && !metadataCheck;
    
    if (tablesExist) {
      console.log('All analysis tables exist');
      return true;
    } else {
      console.error('Some tables are missing:', {
        vocabulary: vocabCheck,
        tone: toneCheck,
        habits: habitsCheck,
        metadata: metadataCheck
      });
      return false;
    }
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}

/**
 * Check if analysis needs to be refreshed based on sample count and age
 */
export async function shouldRefreshAnalysis(currentSampleCount: number): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) return true;

    const { data, error } = await supabase.rpc('should_refresh_analysis', {
      p_user_id: user.user.id,
      p_current_sample_count: currentSampleCount
    });

    if (error) {
      console.error('Error checking refresh status:', error);
      return true; // Default to refresh if error
    }

    return data;
  } catch (error) {
    console.error('Error in shouldRefreshAnalysis:', error);
    return true;
  }
}

/**
 * Store analysis data in the database
 */
export async function storeAnalysisData(
  vocabulary: WordData[],
  toneAnalysis: ToneData[],
  formattingHabits: string[],
  sampleCount: number
): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) throw new Error('User not authenticated');

    const userId = user.user.id;
    
    // Validate input data
    console.log('Input validation:', {
      vocabularyLength: vocabulary?.length || 0,
      toneAnalysisLength: toneAnalysis?.length || 0,
      formattingHabitsLength: formattingHabits?.length || 0,
      sampleCount,
      userId
    });
    
    if (!vocabulary || !toneAnalysis || !formattingHabits) {
      throw new Error('Invalid input data: vocabulary, toneAnalysis, or formattingHabits is null/undefined');
    }
    
    // Ensure tables exist before proceeding
    const tablesExist = await ensureTablesExist();
    if (!tablesExist) {
      throw new Error('Required analysis tables do not exist. Please run the database migrations first.');
    }

    // Clear existing data first
    console.log('Clearing existing analysis data for user:', userId);
    const clearResults = await Promise.all([
      supabase.from('style_vocabulary').delete().eq('user_id', userId),
      supabase.from('style_tone_analysis').delete().eq('user_id', userId),
      supabase.from('style_formatting_habits').delete().eq('user_id', userId)
    ]);
    
    // Log any clear errors
    clearResults.forEach((result, index) => {
      if (result.error) {
        console.warn(`Clear operation ${index} had error:`, result.error);
      }
    });

    // Store vocabulary data
    if (vocabulary.length > 0) {
      console.log('Storing vocabulary data:', vocabulary.length, 'words');
      const vocabData = vocabulary.map(word => ({
        user_id: userId,
        word: word.text,
        frequency: word.frequency,
        category: word.category || 'business'
      }));
      
      const { data: vocabResult, error: vocabError } = await supabase
        .from('style_vocabulary')
        .insert(vocabData)
        .select();

      if (vocabError) {
        console.error('Error storing vocabulary:', {
          message: vocabError.message,
          details: vocabError.details,
          hint: vocabError.hint,
          code: vocabError.code,
          fullError: vocabError
        });
        console.error('Vocabulary data attempted:', vocabData);
        throw new Error(`Vocabulary storage failed: ${vocabError.message || 'Unknown error'}`);
      }
      
      console.log('Vocabulary stored successfully:', vocabResult?.length, 'records');
    }

    // Store tone analysis data
    if (toneAnalysis.length > 0) {
      console.log('Storing tone analysis data:', toneAnalysis.length, 'tones');
      const toneData = toneAnalysis.map(tone => ({
        user_id: userId,
        tone_name: tone.name,
        percentage: tone.percentage,
        color: tone.color,
        description: tone.description
      }));
      
      const { data: toneResult, error: toneError } = await supabase
        .from('style_tone_analysis')
        .insert(toneData)
        .select();

      if (toneError) {
        console.error('Error storing tone analysis:', {
          message: toneError.message,
          details: toneError.details,
          hint: toneError.hint,
          code: toneError.code,
          fullError: toneError
        });
        console.error('Tone data attempted:', toneData);
        throw new Error(`Tone analysis storage failed: ${toneError.message || 'Unknown error'}`);
      }
      
      console.log('Tone analysis stored successfully:', toneResult?.length, 'records');
    }

    // Store formatting habits
    if (formattingHabits.length > 0) {
      console.log('Storing formatting habits:', formattingHabits.length, 'habits');
      const habitsData = formattingHabits.map(habit => ({
        user_id: userId,
        habit_text: habit,
        confidence_score: 0.8 // Default confidence
      }));
      
      const { data: habitsResult, error: habitsError } = await supabase
        .from('style_formatting_habits')
        .insert(habitsData)
        .select();

      if (habitsError) {
        console.error('Error storing formatting habits:', {
          message: habitsError.message,
          details: habitsError.details,
          hint: habitsError.hint,
          code: habitsError.code,
          fullError: habitsError
        });
        console.error('Habits data attempted:', habitsData);
        throw new Error(`Formatting habits storage failed: ${habitsError.message || 'Unknown error'}`);
      }
      
      console.log('Formatting habits stored successfully:', habitsResult?.length, 'records');
    }

    // Update metadata
    const { error: metaError } = await supabase
      .from('style_analysis_metadata')
      .upsert({
        user_id: userId,
        last_analyzed_at: new Date().toISOString(),
        total_samples_analyzed: sampleCount,
        analysis_version: '1.0',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (metaError) {
      console.error('Error updating metadata:', {
        message: metaError.message,
        details: metaError.details,
        hint: metaError.hint,
        code: metaError.code,
        fullError: metaError
      });
      throw new Error(`Metadata update failed: ${metaError.message || 'Unknown error'}`);
    }

  } catch (error) {
    console.error('Error storing analysis data:', error);
    throw error;
  }
}

/**
 * Retrieve stored analysis data from the database
 */
export async function getStoredAnalysisData(): Promise<StoredAnalysisData | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) return null;

    const userId = user.user.id;

    // Get vocabulary data
    const { data: vocabulary, error: vocabError } = await supabase
      .from('style_vocabulary')
      .select('word, frequency, category')
      .eq('user_id', userId)
      .order('frequency', { ascending: false })
      .limit(25);

    if (vocabError) {
      console.error('Error fetching vocabulary:', vocabError);
      return null;
    }

    // Get tone analysis data
    const { data: toneAnalysis, error: toneError } = await supabase
      .from('style_tone_analysis')
      .select('tone_name, percentage, color, description')
      .eq('user_id', userId)
      .order('percentage', { ascending: false });

    if (toneError) {
      console.error('Error fetching tone analysis:', toneError);
      return null;
    }

    // Get formatting habits
    const { data: formattingHabits, error: habitsError } = await supabase
      .from('style_formatting_habits')
      .select('habit_text, confidence_score')
      .eq('user_id', userId)
      .order('confidence_score', { ascending: false });

    if (habitsError) {
      console.error('Error fetching formatting habits:', habitsError);
      return null;
    }

    // Get metadata
    const { data: metadata, error: metaError } = await supabase
      .from('style_analysis_metadata')
      .select('last_analyzed_at, total_samples_analyzed')
      .eq('user_id', userId)
      .single();

    if (metaError) {
      console.error('Error fetching metadata:', metaError);
      return null;
    }

    // Transform data to expected format
    const transformedVocabulary: WordData[] = (vocabulary || []).map((item: {word: string, frequency: number, category: string}) => ({
      text: item.word,
      frequency: item.frequency,
      category: item.category as WordData['category']
    }));

    const transformedToneAnalysis: ToneData[] = (toneAnalysis || []).map((item: {tone_name: string, percentage: number, color: string, description: string}) => ({
      name: item.tone_name,
      percentage: item.percentage,
      color: item.color,
      description: item.description
    }));

    const transformedFormattingHabits: string[] = (formattingHabits || []).map((item: {habit_text: string}) => item.habit_text);

    return {
      vocabulary: transformedVocabulary,
      toneAnalysis: transformedToneAnalysis,
      formattingHabits: transformedFormattingHabits,
      lastAnalyzed: new Date(metadata.last_analyzed_at),
      sampleCount: metadata.total_samples_analyzed
    };

  } catch (error) {
    console.error('Error retrieving stored analysis data:', error);
    return null;
  }
}
