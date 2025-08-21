import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // 1) Auth - Get current user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // Ignore in server component
            }
          },
          remove(name: string, options: Record<string, unknown>) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // Ignore in server component
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2) Parse request body
    const { content, styleCount, focusAreas } = await request.json();
    
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // 3) Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API not configured' },
        { status: 500 }
      );
    }

    // 4) Call OpenAI API for intelligent vocabulary analysis
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using the most cost-effective model
        messages: [
          {
            role: 'system',
            content: `You are an expert content analyst specializing in identifying signature vocabulary, phrases, and writing patterns. Your task is to analyze content and extract meaningful vocabulary that represents the author's unique voice.

IMPORTANT RULES:
- Focus on PHRASES, PATTERNS, and COLLOCATIONS, not individual words
- AVOID pronouns, common nouns, animal names, place names, or generic things
- Look for idiomatic expressions, business jargon, creative phrases
- Identify transition phrases, emphasis patterns, and unique combinations
- Consider context and semantic meaning, not just frequency
- Return only vocabulary that truly represents the author's style

Return a JSON array of vocabulary items with this structure:
{
  "text": "the phrase or pattern",
  "frequency": estimated frequency (1-10),
  "category": "business|action|emotion|casual|technical|pattern|phrase",
  "confidence": 0.0-1.0,
  "context": "brief explanation of why this is signature vocabulary"
}`
          },
          {
            role: 'user',
            content: `Analyze this content for signature vocabulary and patterns. Focus on phrases, collocations, and unique expressions that represent the author's voice:

Content: ${content.substring(0, 4000)} // Limit content length for API efficiency

Style Count: ${styleCount}
Focus Areas: ${focusAreas?.join(', ') || 'phrases, patterns, collocations'}

Return only the JSON array, no other text.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3, // Lower temperature for more consistent results
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const aiResponse = openAIData.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI API');
    }

    // 5) Parse OpenAI response and extract vocabulary
    let vocabulary = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        vocabulary = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse the entire response
        vocabulary = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.log('Raw AI response:', aiResponse);
      
      // Return fallback vocabulary based on content analysis
      vocabulary = generateFallbackVocabulary(content);
    }

    // 6) Validate and clean vocabulary data
    const validatedVocabulary = vocabulary
      .filter((item: unknown) => item && typeof item === 'object' && item !== null && 'text' in item && typeof (item as { text: unknown }).text === 'string')
      .map((item: unknown) => {
        const typedItem = item as { text: unknown; frequency?: unknown; category?: unknown; confidence?: unknown; context?: unknown };
        return {
          text: String(typedItem.text).trim(),
          frequency: Math.max(1, Math.min(10, Math.floor(Number(typedItem.frequency) || 1))),
          category: validateCategory(typedItem.category),
          confidence: Math.max(0, Math.min(1, Number(typedItem.confidence) || 0.7)),
          context: String(typedItem.context || '').trim() || 'Identified through AI analysis'
        };
      })
      .filter((item: { text: string }) => item.text.length > 0)
      .slice(0, 25); // Limit to top 25 items

    // 7) Store analysis metadata for future reference
    await supabase
      .from('style_analysis_metadata')
      .upsert({
        user_id: user.id,
        last_analyzed_at: new Date().toISOString(),
        total_samples_analyzed: styleCount,
        analysis_version: '2.0-ai-powered'
      });

    return NextResponse.json({
      success: true,
      vocabulary: validatedVocabulary,
      analysisType: 'ai-powered',
      itemsFound: validatedVocabulary.length,
      model: 'gpt-4o-mini'
    });

  } catch (error) {
    console.error('Vocabulary analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze vocabulary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Fallback vocabulary generation if OpenAI fails
function generateFallbackVocabulary(content: string): Array<{
  text: string;
  frequency: number;
  category: string;
  confidence: number;
  context: string;
}> {
  const phrases = [
    'game changer', 'next level', 'on point', 'spot on',
    'think outside the box', 'break the mold', 'raise the bar',
    'high impact', 'deep dive', 'quick win', 'big picture',
    'hands on', 'cutting edge', 'state of the art', 'best practice'
  ];

  return phrases
    .filter(phrase => content.toLowerCase().includes(phrase))
    .map(phrase => ({
      text: phrase,
      frequency: 1,
      category: 'phrase',
      confidence: 0.5,
      context: 'Fallback pattern detection'
    }));
}

// Validate category values
function validateCategory(category: unknown): string {
  const validCategories = ['business', 'action', 'emotion', 'casual', 'technical', 'pattern', 'phrase'];
  return typeof category === 'string' && validCategories.includes(category) ? category : 'phrase';
}
