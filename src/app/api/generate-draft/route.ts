import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { SupabaseVectorStore } from '@/infrastructure/supabase/SupabaseVectorStore';
import { StyleService } from '@/core/application/StyleService';

const GenerateDraftSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  platforms: z.array(z.enum(['x', 'linkedin', 'instagram'])).optional(),
  tones: z.array(z.string()).optional(),
});

const platformPrompts = {
  x: `You are a social media expert specializing in X (Twitter) content optimization. Your goal is to create engaging, structured content that drives engagement.

CONTENT STRUCTURE FOR X:
1. **Point-Based Format**: Structure content as 2-3 distinct, impactful points
2. **Character Optimization**: Each point should be 150-200 characters (leaving room for formatting)
3. **Minimal Emojis**: Use maximum 1 relevant emoji per point, avoid excessive emoji usage
4. **Standalone Points**: Each point should work independently as a complete thought
5. **Clear Structure**: Use numbered points (1/, 2/, 3/) for easy reading
6. **Hashtag Strategy**: Use 1-2 relevant hashtags, avoid hashtag spam
7. **Engaging Tone**: Conversational, informative, and shareable
8. **Topic Focus**: Stay focused on one main topic with clear insights
9. **Thread Ready**: Format as separate sentences that can be easily split into threads
10. **Quality Over Quantity**: Better to have 2-3 strong points than many weak ones

IMPORTANT: Create content that naturally breaks into 2-3 points. Each point should be a complete thought that can stand alone. Avoid excessive emojis and focus on clear, actionable insights. The content should be easy to read and share.`,

  linkedin: `You are a LinkedIn content optimization expert. Your goal is to create professional, thought-leadership content that drives engagement and visibility.

LINKEDIN VIRALITY FRAMEWORKS:
1. Professional Hook: Start with industry insights or professional challenges
2. Storytelling: Use personal anecdotes or case studies
3. Value-First: Lead with actionable insights or knowledge sharing
4. Industry Relevance: Reference current industry trends or challenges
5. Professional Tone: Maintain business-appropriate language while being engaging
6. Engagement Elements: Include polls, questions, or calls for discussion
7. Credibility Markers: Use data, research, or expert opinions
8. Network Building: Encourage connections and professional relationships
9. Thought Leadership: Position as industry expert or innovator
10. Call-to-Connection: Invite professional networking or collaboration
11. Format Optimization: Use line breaks, bullet points, and emojis professionally

Create professional, engaging LinkedIn content about the given topic that establishes thought leadership and encourages professional engagement.`,

  instagram: `You are an Instagram caption generator. Write a single, scroll-stopping IG caption for a feed post.

REQUIREMENTS:
- First line must be a compelling hook (no hashtags)
- Use natural emojis and line breaks for rhythm
- Provide a clear call-to-action near the end (save/share/comment)
- Add a compact block of 10-18 relevant hashtags at the end only
- Keep voice authentic, concise, and mobile-friendly
- Do NOT include markdown headings or labels; output only the caption text`
};

// Helper function to split content into Twitter thread
function sanitizeTwitterOutput(text: string): string {
  // Remove headings like "Tweet 1:", "## Tweet 2:", etc.
  let cleaned = text.replace(/^\s*#{0,6}\s*Tweet\s*\d+\s*:\s*/gim, '');
  return cleaned.trim();
}

function createTwitterThread(content: string): string[] {
  const maxChars = 270; // Leave some buffer for thread indicators
  const sanitized = sanitizeTwitterOutput(content);
  const sentences = sanitized.split(/[.!?]+/).filter(s => s.trim());
  const threads: string[] = [];
  let currentThread = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    const potentialThread = currentThread ? `${currentThread}. ${trimmedSentence}` : trimmedSentence;

    if (potentialThread.length <= maxChars) {
      currentThread = potentialThread;
    } else {
      if (currentThread) {
        threads.push(currentThread);
        currentThread = trimmedSentence;
      } else {
        // If single sentence is too long, add it anyway
        threads.push(trimmedSentence);
        currentThread = '';
      }
    }
  }

  if (currentThread) {
    threads.push(currentThread);
  }

  // Add thread indicators and emojis
  if (threads.length > 1) {
    threads[0] = `${threads[0]} 🧵👇`;
    for (let i = 1; i < threads.length - 1; i++) {
      threads[i] = `${i + 1}/ ${threads[i]}`;
    }
    if (threads.length > 1) {
      threads[threads.length - 1] = `${threads.length}/ ${threads[threads.length - 1]}`;
    }
  }

  return threads;
}

// Enhanced function to create optimized Twitter threads with better structure
function createOptimizedTwitterThread(content: string, topic: string): string[] {
  const sanitized = sanitizeTwitterOutput(content);

  // If content is short enough, return as single tweet
  if (sanitized.length <= 280) {
    return [sanitized];
  }

  // Extract key points and create structured tweets (2-3 max)
  const sentences = sanitized.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const threads: string[] = [];
  let currentPoint = '';
  let pointNumber = 1;

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length === 0) continue;

    // Check if this sentence would make a good standalone point
    if (trimmed.length >= 50 && trimmed.length <= 200) {
      // Format as numbered point with minimal emojis
      const formattedPoint = formatTwitterPoint(trimmed, pointNumber, topic);

      if (formattedPoint.length <= 280) {
        threads.push(formattedPoint);
        pointNumber++;

        // Limit to 3 tweets maximum
        if (threads.length >= 3) break;
      }
    } else if (currentPoint.length + trimmed.length + 1 <= 200) {
      // Combine shorter sentences
      currentPoint += (currentPoint ? ' ' : '') + trimmed;
    } else {
      // Finalize current point
      if (currentPoint) {
        const formattedPoint = formatTwitterPoint(currentPoint, pointNumber, topic);
        if (formattedPoint.length <= 280) {
          threads.push(formattedPoint);
          pointNumber++;
          if (threads.length >= 3) break;
        }
      }
      currentPoint = trimmed;
    }
  }

  // Add remaining content as final point
  if (currentPoint && threads.length < 3) {
    const formattedPoint = formatTwitterPoint(currentPoint, pointNumber, topic);
    if (formattedPoint.length <= 280) {
      threads.push(formattedPoint);
    }
  }

  // If no threads created, fall back to original content
  return threads.length > 0 ? threads : [sanitized];
}

// Helper function to format individual tweet points
function formatTwitterPoint(content: string, pointNumber: number, topic: string): string {
  // Remove excessive emojis, keep only 1-2 relevant ones
  const emojiMap: { [key: string]: string } = {
    'AI': '🤖',
    'technology': '💻',
    'business': '💼',
    'innovation': '🚀',
    'future': '🔮',
    'data': '📊',
    'growth': '📈',
    'success': '🎯',
    'learning': '📚',
    'health': '🏥',
    'finance': '💰',
    'creativity': '🎨',
    'social': '🌐',
    'environment': '🌱',
    'customer': '👥',
    'experience': '💡',
    'emotional': '❤️',
    'empathy': '🤗'
  };

  // Find relevant emoji based on content
  let relevantEmoji = '';
  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (content.toLowerCase().includes(keyword.toLowerCase())) {
      relevantEmoji = emoji;
      break;
    }
  }

  // Format: "PointNumber/ Content [Emoji] #Topic"
  const baseContent = `${pointNumber}/ ${content}`;
  const hashtag = `#${topic.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`;

  if (relevantEmoji && baseContent.length + relevantEmoji.length + hashtag.length + 2 <= 280) {
    return `${baseContent} ${relevantEmoji} ${hashtag}`;
  } else if (baseContent.length + hashtag.length + 1 <= 280) {
    return `${baseContent} ${hashtag}`;
  } else {
    return baseContent;
  }
}

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
    const validation = GenerateDraftSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.message },
        { status: 400 }
      );
    }

    const { topic, platforms = ['x', 'linkedin', 'instagram'], tones = [] } = validation.data;

    // 3) Generate content for all requested platforms in parallel
    const platformPromises = platforms.map(async (platform) => {
      try {
        let systemPrompt = platformPrompts[platform];

        // Add tone information
        if (tones.length > 0) {
          systemPrompt += `\n\nTONE REQUIREMENTS: Incorporate these tones: ${tones.join(', ')}.`;
        }

        // Style few-shots from user's saved samples
        let styleFewShots: string[] = [];
        try {
          // Retrieve from StyleService
          const vectorStore = new SupabaseVectorStore();
          const styleService = new StyleService(vectorStore);
          styleFewShots = await styleService.findSimilarStyles(user.id, platform as 'x' | 'linkedin' | 'instagram', topic, 4);
        } catch (e) {
          console.error('Style few-shots retrieval failed:', e);
        }

        // 4) Call OpenAI
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: systemPrompt + (styleFewShots.length > 0 ? `\n\nSTYLE REFERENCE SAMPLES (mimic tone/voice; do not copy verbatim):\n${styleFewShots.map((s, i) => `[Sample ${i + 1}] ${s}`).join('\n\n')}` : '')
              },
              {
                role: 'user',
                content: `Create engaging content for ${platform} about: ${topic}. Output only the final text for the platform with no extra labels.`
              }
            ],
            max_tokens: 800,
            temperature: 0.7
          }),
        });

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.json();
          console.error(`OpenAI API error for ${platform}:`, errorData);
          return { platform, error: 'Failed to generate content' };
        }

        const openaiData = await openaiResponse.json();
        const generatedContent = openaiData.choices?.[0]?.message?.content;

        if (!generatedContent) return { platform, error: 'No content generated' };

        // Handle Twitter threading
        if (platform === 'x') {
          // Assuming createOptimizedTwitterThread is available in scope
          const threads = createOptimizedTwitterThread(generatedContent, topic);
          return {
            platform,
            content: generatedContent,
            threads: threads.map((thread, index) => ({
              id: (index + 1).toString(),
              content: thread,
              characterCount: thread.length
            })),
            isThread: threads.length > 1
          };
        }

        return { platform, content: generatedContent };

      } catch (err) {
        console.error(`Error generating for ${platform}:`, err);
        return { platform, error: 'Internal generation error' };
      }
    });

    const resultsArray = await Promise.all(platformPromises);

    // Transform array back to object
    const results: Record<string, any> = {};
    resultsArray.forEach(res => {
      if (res) {
        const { platform, ...data } = res;
        results[platform] = data;
      }
    });

    // 5) Image generation is now handled separately via /api/generate-image endpoint
    // This allows users to generate images only when needed for LinkedIn/Instagram

    // 6) Return the generated content for all platforms
    console.log('🎉 Final API Response:', JSON.stringify({
      ok: true,
      topic,
      platforms: results,
      message: 'Content generated successfully for all platforms'
    }, null, 2));

    return NextResponse.json({
      ok: true,
      topic,
      platforms: results,
      message: 'Content generated successfully for all platforms'
    });

  } catch (error) {
    console.error('Draft generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
