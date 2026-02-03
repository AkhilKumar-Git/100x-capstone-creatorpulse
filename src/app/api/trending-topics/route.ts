
import { NextResponse } from 'next/server';
import { TrendService } from '@/core/application/TrendService';
import { OpenAIProvider } from '@/infrastructure/providers/OpenAIProvider';
import { PerplexityProvider } from '@/infrastructure/providers/PerplexityProvider';
import { FirecrawlProvider } from '@/infrastructure/providers/FirecrawlProvider';
import { SupabaseVectorStore } from '@/infrastructure/supabase/SupabaseVectorStore';
import { ITrendProvider } from '@/core/domain/interfaces/ITrendProvider'; // Fixed import path
import { sbServer } from '@/infrastructure/supabase/server';

export async function GET(request: Request) {
  try {
    const sb = await sbServer();
    const { data: { user } } = await sb.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get parameters
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const force = searchParams.get('force') === 'true';

    // 1. Check for active sources if no topic provided
    const { data: sources, error: sourcesError } = await sb
      .from('sources')
      .select('id')
      .eq('user_id', user.id)
      .eq('active', true);

    if (!topic && (!sources || sources.length === 0)) {
      console.log('No topic and no active sources. Returning empty trends.');
      return NextResponse.json({ 
        trends: [],
        source: 'none',
        message: 'Add sources or search for a topic to see trends'
      });
    }

    // 2. Check database first (unless force)
    if (!force) {
      const today = new Date();
      today.setHours(today.getHours() - 12); // Look for trends from last 12 hours

      let query = sb.from('trend_items')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .order('score', { ascending: false });

      if (topic) {
        // Find items where metadata->query matches topic
        query = query.filter('metadata->>query', 'eq', topic);
      } else {
        // For global, look for items where query is null or explicitly 'global'
        query = query.or('metadata->>query.is.null,metadata->>query.eq.""');
      }

      const { data: existingTrends, error: dbError } = await query;

      if (!dbError && existingTrends && existingTrends.length > 0) {
        console.log('Returning trends from database for user:', user.id);
        return NextResponse.json({
          trends: existingTrends.map(t => ({
            id: t.id,
            topic_name: t.title,
            description: t.summary,
            score: t.score,
            source: t.source_type || 'database'
          })),
          source: 'database'
        });
      }
    }

    // 3. Discover trends if none found or forced
    const vectorStore = new SupabaseVectorStore();
    const providers: ITrendProvider[] = [];

    if (process.env.OPENAI_API_KEY) providers.push(new OpenAIProvider());
    if (process.env.PERPLEXITY_API_KEY) providers.push(new PerplexityProvider());
    if (process.env.FIRECRAWL_API_KEY) providers.push(new FirecrawlProvider());

    const trendService = new TrendService(providers, vectorStore);

    const context = {
      niche: 'Tech & AI',
      audience: 'Entrepreneurs',
      geo: 'US',
      topic: topic || undefined
    };

    const trends = await trendService.discoverTrends(context);

    // Map to frontend format
    const mappedTrends = trends.map((t, i) => ({
      id: t.id || `trend-${Date.now()}-${i}`,
      topic_name: t.topic,
      momentum_score: t.score,
      description: t.description,
      source: t.source
    }));

    // 4. Save to database for persistence
    if (mappedTrends.length > 0) {
      const toInsert = mappedTrends.map(t => ({
        user_id: user.id,
        title: t.topic_name,
        summary: t.description,
        score: t.momentum_score,
        source_type: t.source,
        metadata: { 
          query: topic || null, 
          type: 'discovery',
          discovered_at: new Date().toISOString()
        }
      }));
      
      const { error: insertError } = await sb.from('trend_items').insert(toInsert);
      if (insertError) {
        console.error('Error saving trends to database:', insertError);
      } else {
        console.log(`Saved ${mappedTrends.length} trends to database for user:`, user.id);
      }
    }

    return NextResponse.json({ 
      trends: mappedTrends,
      source: 'live-aggregated' 
    });

  } catch (error) {
    console.error('Trend API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
