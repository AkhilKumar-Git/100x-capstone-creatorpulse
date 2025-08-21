import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const GenerateBodySchema = z.object({
  forceRegenerate: z.boolean().optional()
});

export async function POST(request: NextRequest) {
  try {
    // 1) Get authenticated user
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
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Authentication error', reason: 'Auth session missing!' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id);

    // 2) Parse request body
    const body = await request.json();
    const { forceRegenerate = false } = GenerateBodySchema.parse(body);

    // 3) Check if daily generation already exists (unless force regenerate)
    if (!forceRegenerate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: existingTopics, error: checkError } = await supabase
        .from('trend_items')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .limit(1);

      if (checkError) {
        console.error('Error checking existing topics:', checkError);
      } else if (existingTopics && existingTopics.length > 0) {
        console.log('Daily topics already generated for user:', user.id);
        return NextResponse.json(
          { 
            ok: false, 
            reason: 'Daily trending topics already generated',
            alreadyGenerated: true 
          },
          { status: 409 }
        );
      }
    }

    // 4) Fetch active sources
    console.log('Fetching active sources for user:', user.id);
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true);

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
      return NextResponse.json(
        { error: 'Failed to fetch sources', reason: sourcesError.message },
        { status: 500 }
      );
    }

    console.log('Found active sources:', sources?.length || 0);

    if (!sources || sources.length === 0) {
      return NextResponse.json(
        { error: 'No active sources', reason: 'Please add and activate at least one source' },
        { status: 400 }
      );
    }

    // 5) Use Supabase Edge Function for real-time ingestion and AI analysis
    console.log('Starting real-time ingestion using Supabase Edge Function');
    
    // Prepare source data for Edge Function
    const xHandles = sources.filter(s => s.type === 'x' && s.is_active).map(s => s.handle).filter(Boolean);
    const youtubeChannels = sources.filter(s => s.type === 'youtube' && s.is_active).map(s => s.handle).filter(Boolean);
    const blogUrls = sources.filter(s => s.type === 'blog' && s.is_active).map(s => s.url).filter(Boolean);
    const rssUrls = sources.filter(s => s.type === 'rss' && s.is_active).map(s => s.url).filter(Boolean);
    
    console.log('Sources prepared for Edge Function:', {
      xHandles,
      youtubeChannels,
      blogUrls,
      rssUrls
    });
    
    // Call the Edge Function
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/daily_generate`;
    const edgeFunctionResponse = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        user_id: user.id,
        x_handles: xHandles,
        youtube_channel_ids: youtubeChannels,
        blog_urls: blogUrls,
        rss_urls: rssUrls
      })
    });
    
    if (!edgeFunctionResponse.ok) {
      const errorText = await edgeFunctionResponse.text();
      console.error('Edge Function error:', errorText);
      throw new Error(`Edge Function failed: ${edgeFunctionResponse.status} - ${errorText}`);
    }
    
    const edgeFunctionResult = await edgeFunctionResponse.json();
    console.log('Edge Function result:', edgeFunctionResult);
    
    if (!edgeFunctionResult.ok) {
      throw new Error('Edge Function returned error');
    }
    
    // The Edge Function already handles database insertion and draft generation
    // We just need to return success
    console.log(`Successfully generated ${edgeFunctionResult.trends || 0} trending topics via Edge Function`);

    // Return success response
    return NextResponse.json({
      ok: true,
      message: `Successfully generated trending topics from ${sources.length} sources`,
      trends: edgeFunctionResult.trends || 0,
      sources: sources.length
    });

  } catch (error: unknown) {
    console.error('Generate now error:', error);
    return NextResponse.json(
      { 
        error: 'Generation failed', 
        reason: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}