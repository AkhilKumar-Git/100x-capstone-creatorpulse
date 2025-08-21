import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  console.log('Trending topics API called');
  
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
    
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication error', details: authError.message },
        { status: 401 }
      );
    }
    
    if (!user) {
      console.log('No user found');
      return NextResponse.json(
        { error: 'No authenticated user' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id);

    // 2) Fetch user's active sources only
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('id, type, handle, url, active')
      .eq('user_id', user.id)
      .eq('active', true);

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
      return NextResponse.json(
        { error: 'Failed to fetch sources', details: sourcesError.message },
        { status: 500 }
      );
    }

    console.log('Sources fetched:', sources?.length || 0);

    // 3) Fetch trending topics from the trend_items table
    const { data: trendingTopics, error: topicsError } = await supabase
      .from('trend_items')
      .select('*')
      .eq('user_id', user.id)
      .order('score', { ascending: false })
      .limit(5);

    if (topicsError) {
      console.error('Error fetching trending topics:', topicsError);
      return NextResponse.json(
        { error: 'Failed to fetch trending topics', details: topicsError.message },
        { status: 500 }
      );
    }

    console.log('Trending topics fetched:', trendingTopics?.length || 0);

    // 4) Fetch user's drafts
    const { data: drafts, error: draftsError } = await supabase
      .from('drafts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (draftsError) {
      console.error('Error fetching drafts:', draftsError);
      return NextResponse.json(
        { error: 'Failed to fetch drafts', details: draftsError.message },
        { status: 500 }
      );
    }

    console.log('Drafts fetched:', drafts?.length || 0);

    // 5) Process trending topics with source attribution
    const processedTopics = trendingTopics?.map((topic: any) => {
      console.log('Processing topic from trend_items:', topic);
      const processed = {
        id: topic.id,
        topic_name: topic.title || topic.item_name,
        momentum_score: topic.score || topic.trending_score || 0,
        description: topic.summary || topic.item_content,
        source_ids: topic.contributing_sources || [],
        created_at: topic.created_at,
        updated_at: topic.updated_at
      };
      console.log('Processed topic result:', processed);
      return processed;
    }) || [];

    // Process sources for avatar display
    const processedSources = sources?.map((source: any) => ({
      id: source.id,
      type: source.type,
      handle: source.handle,
      url: source.url,
      name: source.handle || source.url || `${source.type} source`,
      avatar: getSourceAvatar(source.type, source.handle, source.url)
    })) || [];

    // Process drafts
    const processedDrafts = drafts?.map((draft: any) => ({
      id: draft.id,
      title: draft.title,
      content: draft.content,
      platform: draft.platform,
      status: draft.status,
      created_at: draft.created_at,
      draft_title: draft.draft_title,
      metadata: draft.metadata
    })) || [];

    const response = {
      topics: processedTopics,
      sources: processedSources,
      drafts: processedDrafts,
      topicsCount: processedTopics.length,
      sourcesCount: processedSources.length,
      draftsCount: processedDrafts.length
    };

    console.log('API response prepared:', {
      topicsCount: response.topicsCount,
      draftsCount: response.draftsCount,
      sourcesCount: response.sourcesCount
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error in trending topics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get source avatar/icon
function getSourceAvatar(type: string, handle?: string, url?: string): string {
  switch (type) {
    case 'x':
      return `https://ui-avatars.com/api/?name=${handle || 'X'}&background=1DA1F2&color=fff&size=40`;
    case 'youtube':
      return `https://ui-avatars.com/api/?name=${handle || 'YT'}&background=FF0000&color=fff&size=40`;
    case 'rss':
      return `https://ui-avatars.com/api/?name=${handle || 'RSS'}&background=FF6600&color=fff&size=40`;
    case 'blog':
      return `https://ui-avatars.com/api/?name=${handle || 'Blog'}&background=64748B&color=fff&size=40`;
    default:
      return `https://ui-avatars.com/api/?name=${handle || 'Source'}&background=64748B&color=fff&size=40`;
  }
}
