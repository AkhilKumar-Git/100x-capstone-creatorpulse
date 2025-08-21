import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const OptimizeDraftSchema = z.object({
  draftId: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  platform: z.enum(['x', 'linkedin', 'instagram']),
  originalDraftId: z.string().optional(),
});

const platformPrompts = {
  x: `You are a social media expert specializing in X (Twitter) content optimization. Your goal is to make content go viral by following these frameworks:

VIRALITY FRAMEWORKS FOR X:
1. Hook Pattern: Start with a compelling hook (question, statement, or curiosity gap)
2. Pattern Interrupt: Break common expectations or use surprising facts
3. Social Proof: Include numbers, statistics, or social validation
4. Emotional Triggers: Use words that evoke strong emotions
5. Hashtag Strategy: Use 2-3 relevant hashtags strategically placed
6. Engagement Questions: End with a question that encourages replies
7. Thread Potential: Structure for potential thread expansion
8. Trending Topics: Reference current events or trending hashtags
9. Character Optimization: Use exactly 280 characters for maximum impact
10. Call-to-Action: Clear, specific action for readers

OPTIMIZE THIS CONTENT for X following the virality frameworks above. Make it engaging, shareable, and optimized for the X algorithm. Return only the optimized content, no explanations.`,

  linkedin: `You are a LinkedIn content optimization expert. Your goal is to create professional, thought-leadership content that drives engagement and visibility.

LINKEDIN VIRALITY FRAMEWORKS:
1. Professional Hook: Start with industry insights or professional challenges
2. Storytelling: Use personal anecdotes or case studies
3. Value-First: Lead with actionable insights or knowledge sharing
4. Industry Relevance: Reference current industry trends or challenges
5. Professional Tone: Maintain business-appropriate language
6. Engagement Elements: Include polls, questions, or calls for discussion
7. Credibility Markers: Use data, research, or expert opinions
8. Network Building: Encourage connections and professional relationships
9. Thought Leadership: Position as industry expert or innovator
10. Call-to-Connection: Invite professional networking or collaboration

OPTIMIZE THIS CONTENT for LinkedIn following the frameworks above. Make it professional, insightful, and optimized for LinkedIn's algorithm. Return only the optimized content, no explanations.`,

  instagram: `You are an Instagram content optimization expert. Your goal is to create visually appealing, engaging content that drives likes, comments, and shares.

INSTAGRAM VIRALITY FRAMEWORKS:
1. Visual Storytelling: Create content that works with images/videos
2. Hashtag Strategy: Use 15-30 relevant hashtags for discoverability
3. Engagement Hooks: Start with questions or relatable statements
4. Trend Integration: Reference current Instagram trends or challenges
5. Community Building: Use inclusive language and encourage interaction
6. Authentic Voice: Sound genuine and personal, not corporate
7. Call-to-Action: Clear instructions for engagement (like, comment, share)
8. Relatable Content: Make it personally relevant to target audience
9. Story Potential: Create content that could be expanded in Stories
10. Aesthetic Appeal: Use emojis and formatting for visual appeal

OPTIMIZE THIS CONTENT for Instagram following the frameworks above. Make it visually appealing, engaging, and optimized for Instagram's algorithm. Return only the optimized content, no explanations.`
};

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
              // The `set` method was called from a Server Component.
            }
          },
          remove(name: string, options: Record<string, unknown>) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // The `delete` method was called from a Server Component.
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2) Parse and validate request body
    const body = await request.json();
    const validation = OptimizeDraftSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.message },
        { status: 400 }
      );
    }

    const { draftId, content, platform, originalDraftId } = validation.data;

    // 3) Get the system prompt for the platform
    const systemPrompt = platformPrompts[platform];

    // 4) Call OpenAI for optimization
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Please optimize this content for ${platform}: ${content}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to optimize content', reason: 'AI service unavailable' },
        { status: 500 }
      );
    }

    const openaiData = await openaiResponse.json();
    const optimizedContent = openaiData.choices[0]?.message?.content;

    if (!optimizedContent) {
      return NextResponse.json(
        { error: 'Failed to optimize content', reason: 'No response from AI service' },
        { status: 500 }
      );
    }

    // 5) Save optimized draft to database
    const { data: savedDraft, error: saveError } = await supabase
      .from('drafts')
      .insert({
        user_id: user.id,
        platform,
        content: optimizedContent,
        based_on: originalDraftId || draftId,
        status: 'pending',
        metadata: {
          original_content: content,
          optimization_platform: platform,
          optimized_at: new Date().toISOString(),
          ai_model: 'gpt-4-turbo-preview'
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving optimized draft:', saveError);
      return NextResponse.json(
        { error: 'Failed to save optimized draft' },
        { status: 500 }
      );
    }

    // 6) Return the optimized content
    return NextResponse.json({
      ok: true,
      optimized_content: optimizedContent,
      draft_id: savedDraft.id,
      platform,
      message: `Content optimized for ${platform} successfully`
    });

  } catch (error) {
    console.error('Draft optimization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
