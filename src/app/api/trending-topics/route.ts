import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

    // 2) Fetch user's active sources only
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('id, type, handle, url, active')
      .eq('user_id', user.id)
      .eq('active', true);

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
      return NextResponse.json(
        { error: 'Failed to fetch sources' },
        { status: 500 }
      );
    }

    if (!sources || sources.length === 0) {
      return NextResponse.json({
        topics: [],
        drafts: [],
        sources: []
      });
    }

    // 3) Fetch exactly 5 trending topics with their top 10 trending items
    const { data: trendItems, error: trendsError } = await supabase
      .from('trend_items')
      .select('*')
      .eq('user_id', user.id)
      .order('score', { ascending: false })
      .limit(50); // Get more items to group by topic

    if (trendsError) {
      console.error('Error fetching trend items:', trendsError);
      return NextResponse.json(
        { error: 'Failed to fetch trending topics' },
        { status: 500 }
      );
    }

    // Group items by topic and select top 5 topics with top 10 items each
    const groupedByTopic = groupTrendItemsByTopic(trendItems || []);
    const top5Topics = Object.entries(groupedByTopic)
      .sort(([, a], [, b]) => b.avgScore - a.avgScore)
      .slice(0, 5)
      .map(([topic, data]) => ({
        topic,
        items: data.items.slice(0, 10), // Top 10 items per topic
        avgScore: data.avgScore,
        totalItems: data.items.length
      }));

    if (trendsError) {
      console.error('Error fetching trend items:', trendsError);
      return NextResponse.json(
        { error: 'Failed to fetch trending topics' },
        { status: 500 }
      );
    }

    // 4) Fetch user's drafts
    const { data: drafts, error: draftsError } = await supabase
      .from('drafts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (draftsError) {
      console.error('Error fetching drafts:', draftsError);
      return NextResponse.json(
        { error: 'Failed to fetch drafts' },
        { status: 500 }
      );
    }

    // 5) Process trending topics with source information and metrics
    const processedTopics = top5Topics.map((topicData, index) => {
      // Find only active sources that contributed to this trend
      const contributingSources = sources.filter(source => {
        // Only include active sources
        return source.active === true;
      });

      const sourceIcons = contributingSources.map(source => ({
        id: source.id,
        type: source.type,
        handle: source.handle,
        url: source.url,
        avatar_url: getSourceAvatar(source.type, source.handle || source.url)
      }));

      // Process the top 10 items for this topic
      const processedItems = topicData.items.map(item => ({
        id: item.id,
        title: item.title || 'Untitled Item',
        summary: item.summary || 'No summary available',
        score: item.score,
        source_type: item.source_type,
        source_ref: item.source_ref,
        created_at: item.created_at,
        metrics: extractTrendingMetrics(item.meta)
      }));

      return {
        id: `topic_${index}`,
        topic_name: topicData.topic,
        topic_summary: `Top trending topic with ${topicData.totalItems} items`,
        momentum_score: topicData.avgScore,
        source_count: contributingSources.length,
        source_icons: sourceIcons.slice(0, 5), // Limit to 5 source icons
        last_updated: new Date().toISOString(),
        metrics: {
          engagement_rate: Math.min(topicData.avgScore / 10, 100),
          velocity_score: Math.min(topicData.items.length * 10, 100),
          reach_multiplier: Math.min(topicData.avgScore / 5, 100),
          mentions_count: topicData.totalItems,
          sentiment_score: 50, // Placeholder
          trending_duration: 1 // Placeholder
        },
        source_type: 'mixed',
        source_ref: topicData.topic,
        trending_items: processedItems
      };
    });

    // 6) Process drafts
    const processedDrafts = (drafts || []).map(draft => ({
      id: draft.id,
      platform: draft.platform,
      content: draft.content,
      based_on: draft.based_on,
      status: draft.status,
      created_at: draft.created_at,
      updated_at: draft.updated_at
    }));

    return NextResponse.json({
      topics: processedTopics,
      drafts: processedDrafts,
      sources: sources
    });

  } catch (error) {
    console.error('Trending topics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get source avatars/icons
function getSourceAvatar(type: string, identifier: string | null): string {
  if (!identifier) return '';
  
  switch (type) {
    case 'x':
      // For X, you might want to fetch actual profile pictures
      // For now, return a placeholder
      return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(identifier)}`;
    case 'youtube':
      // YouTube channel avatars
      return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(identifier)}`;
    case 'rss':
      // RSS feed icons (could be favicon)
      return `https://www.google.com/s2/favicons?domain=${identifier}`;
    case 'blog':
      // Blog favicons
      return `https://www.google.com/s2/favicons?domain=${identifier}`;
    default:
      return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(identifier)}`;
  }
}

// Helper function to group trend items by topic
function groupTrendItemsByTopic(trendItems: any[]) {
  const grouped: Record<string, { items: any[], avgScore: number }> = {};
  
  trendItems.forEach(item => {
    // Extract topic from title or create a default topic
    const topic = item.title?.split(' ').slice(0, 3).join(' ') || 'General';
    
    if (!grouped[topic]) {
      grouped[topic] = { items: [], avgScore: 0 };
    }
    
    grouped[topic].items.push(item);
  });
  
  // Calculate average score for each topic
  Object.keys(grouped).forEach(topic => {
    const items = grouped[topic].items;
    const totalScore = items.reduce((sum, item) => sum + (item.score || 0), 0);
    grouped[topic].avgScore = totalScore / items.length;
    
    // Sort items by score within each topic
    grouped[topic].items.sort((a, b) => (b.score || 0) - (a.score || 0));
  });
  
  return grouped;
}

// Helper function to extract trending metrics from meta field
function extractTrendingMetrics(meta: Record<string, unknown> | null) {
  if (!meta) {
    return {
      engagement_rate: 0,
      velocity_score: 0,
      reach_multiplier: 0
    };
  }

  return {
    engagement_rate: meta.engagement_rate as number || 0,
    velocity_score: meta.velocity_score as number || 0,
    reach_multiplier: meta.reach_multiplier as number || 0,
    // Add more metrics as needed
    mentions_count: meta.mentions_count as number || 0,
    sentiment_score: meta.sentiment_score as number || 0,
    trending_duration: meta.trending_duration as number || 0
  };
}
