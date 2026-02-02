"use client";

import { sbClient } from "@/infrastructure/supabase/client";
import type { WordData, ToneData } from "@/shared/utils/style-analysis";

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

    // Clear existing data first and wait for completion
    console.log('Clearing existing analysis data for user:', userId);
    
    try {
      // Clear operations one by one to ensure they complete
      const vocabClearResult = await supabase.from('style_vocabulary').delete().eq('user_id', userId);
      if (vocabClearResult.error) {
        console.warn('Vocabulary clear operation had error:', vocabClearResult.error);
      }
      
      const toneClearResult = await supabase.from('style_tone_analysis').delete().eq('user_id', userId);
      if (toneClearResult.error) {
        console.warn('Tone analysis clear operation had error:', toneClearResult.error);
      }
      
      const habitsClearResult = await supabase.from('style_formatting_habits').delete().eq('user_id', userId);
      if (habitsClearResult.error) {
        console.warn('Formatting habits clear operation had error:', habitsClearResult.error);
      }
      
      // Wait a moment to ensure clear operations complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('Clear operations completed');
    } catch (clearError) {
      console.warn('Error during clear operations:', clearError);
      // Continue with insert operations even if clear fails
    }

    // Store vocabulary data
    if (vocabulary.length > 0) {
      console.log('Storing vocabulary data:', vocabulary.length, 'words');
      
      // Validate vocabulary data before insertion
      const validCategories = ['action', 'emotion', 'business', 'casual', 'technical'];
      const vocabData = vocabulary.map(word => {
        // Ensure category is valid
        const category = word.category && validCategories.includes(word.category) 
          ? word.category 
          : 'business';
        
        // Ensure word is valid string and frequency is valid number
        const wordText = String(word.text || '').trim();
        const frequency = Math.max(1, Math.floor(Number(word.frequency) || 1));
        
        if (!wordText) {
          console.warn('Skipping empty word in vocabulary');
          return null;
        }
        
        return {
          user_id: userId,
          word: wordText,
          frequency: frequency,
          category: category
        };
      }).filter(Boolean); // Remove any null entries
      
      if (vocabData.length === 0) {
        console.warn('No valid vocabulary data to store');
        return;
      }
      
      console.log('Sample vocabulary data:', vocabData.slice(0, 3));
      
      // Remove duplicates based on word text
      const uniqueWords = new Map();
      vocabData.forEach(word => {
        if (word && !uniqueWords.has(word.word)) {
          uniqueWords.set(word.word, word);
        }
      });
      
      const finalVocabData = Array.from(uniqueWords.values());
      
      if (finalVocabData.length === 0) {
        console.warn('No valid vocabulary data to store after deduplication');
        return;
      }
      
      console.log('Sample vocabulary data:', finalVocabData.slice(0, 3));
      
      const { data: vocabResult, error: vocabError } = await supabase
        .from('style_vocabulary')
        .insert(finalVocabData)
        .select();

      if (vocabError) {
        console.error('Error storing vocabulary:', {
          message: vocabError.message,
          details: vocabError.details,
          hint: vocabError.hint,
          code: vocabError.code,
          fullError: vocabError
        });
        console.error('Sample failed data:', vocabData.slice(0, 3));
        throw new Error(`Vocabulary storage failed: ${vocabError.message || 'Unknown error'}`);
      }
      
      console.log('Vocabulary stored successfully:', vocabResult?.length, 'records');
    }

    // Store tone analysis data
    if (toneAnalysis.length > 0) {
      console.log('Storing tone analysis data:', toneAnalysis.length, 'tones');
      
      // Remove duplicates based on tone_name
      const uniqueTones = new Map();
      toneAnalysis.forEach(tone => {
        const toneName = String(tone.name || '').trim();
        if (toneName && !uniqueTones.has(toneName)) {
          uniqueTones.set(toneName, tone);
        }
      });
      
      const toneData = Array.from(uniqueTones.values()).map(tone => {
        const toneName = String(tone.name || '').trim();
        const percentage = Math.max(0, Math.min(100, Math.floor(Number(tone.percentage) || 0)));
        const color = String(tone.color || '#3B82F6').trim();
        const description = tone.description ? String(tone.description).trim() : null;
        
        if (!toneName) {
          console.warn('Skipping tone with empty name');
          return null;
        }
        
        return {
          user_id: userId,
          tone_name: toneName,
          percentage: percentage,
          color: color,
          description: description
        };
      }).filter(Boolean);
      
      if (toneData.length === 0) {
        console.warn('No valid tone analysis data to store');
        return;
      }
      
      console.log('Sample tone data:', toneData.slice(0, 2));
      
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
        console.error('Sample failed tone data:', toneData.slice(0, 2));
        
        // Check if it's a duplicate key violation
        if (toneError.code === '23505' || toneError.message.includes('duplicate key')) {
          console.warn('Duplicate tone names detected, attempting to update existing records...');
          
          // Try to update existing records instead
          const updatePromises = toneData
            .filter(tone => tone !== null)
            .map(tone => 
              supabase
                .from('style_tone_analysis')
                .update({
                  percentage: tone!.percentage,
                  color: tone!.color,
                  description: tone!.description,
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', tone!.user_id)
                .eq('tone_name', tone!.tone_name)
            );
          
          const updateResults = await Promise.all(updatePromises);
          const updateErrors = updateResults.filter(result => result.error);
          
          if (updateErrors.length > 0) {
            console.error('Some tone updates failed:', updateErrors);
            throw new Error(`Tone analysis update failed: ${updateErrors[0].error?.message || 'Unknown error'}`);
          }
          
          console.log('Tone analysis updated successfully');
        } else {
          throw new Error(`Tone analysis storage failed: ${toneError.message || 'Unknown error'}`);
        }
      } else {
        console.log('Tone analysis stored successfully:', toneResult?.length, 'records');
      }
    }

    // Store formatting habits
    if (formattingHabits.length > 0) {
      console.log('Storing formatting habits:', formattingHabits.length, 'habits');
      
      // Remove duplicates
      const uniqueHabits = [...new Set(formattingHabits)];
      
      const habitsData = uniqueHabits.map(habit => {
        const habitText = String(habit || '').trim();
        
        if (!habitText) {
          console.warn('Skipping empty formatting habit');
          return null;
        }
        
        return {
          user_id: userId,
          habit_text: habitText,
          confidence_score: 0.8 // Default confidence
        };
      }).filter(Boolean);
      
      if (habitsData.length === 0) {
        console.warn('No valid formatting habits data to store');
        return;
      }
      
      // Remove duplicates based on habit_text
      const uniqueHabitsMap = new Map();
      habitsData.forEach(habit => {
        if (habit && !uniqueHabitsMap.has(habit.habit_text)) {
          uniqueHabitsMap.set(habit.habit_text, habit);
        }
      });
      
      const finalHabitsData = Array.from(uniqueHabitsMap.values());
      
      if (finalHabitsData.length === 0) {
        console.warn('No valid formatting habits data to store after deduplication');
        return;
      }
      
      console.log('Sample habits data:', finalHabitsData.slice(0, 2));
      
      const { data: habitsResult, error: habitsError } = await supabase
        .from('style_formatting_habits')
        .insert(finalHabitsData)
        .select();

      if (habitsError) {
        console.error('Error storing formatting habits:', {
          message: habitsError.message,
          details: habitsError.details,
          hint: habitsError.hint,
          code: habitsError.code,
          fullError: habitsError
        });
        console.error('Sample failed habits data:', habitsData.slice(0, 2));
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
