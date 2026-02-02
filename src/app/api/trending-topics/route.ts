
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

    // Initialize dependencies
    // In a real app, use a DI container
    const vectorStore = new SupabaseVectorStore();
    const providers: ITrendProvider[] = [];

    if (process.env.OPENAI_API_KEY) providers.push(new OpenAIProvider());
    if (process.env.PERPLEXITY_API_KEY) providers.push(new PerplexityProvider());
    if (process.env.FIRECRAWL_API_KEY) providers.push(new FirecrawlProvider());

    const trendService = new TrendService(providers, vectorStore);

    // Get topic from query params
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');

    // Get user context (mock for now, ideally fetch from profile)
    const context = {
      niche: 'Tech & AI',
      audience: 'Entrepreneurs',
      geo: 'US',
      topic: topic || undefined
    };

    const trends = await trendService.discoverTrends(context);

    // Map to old format for frontend compatibility if needed, or update frontend types
    // The frontend expects: { id, topic_name, description, score, source }
    const mappedTrends = trends.map((t, i) => ({
      id: t.id || `trend-${i}`,
      topic_name: t.topic,
      description: t.description,
      score: t.score,
      source: t.source
    }));

    return NextResponse.json({ 
      trends: mappedTrends,
      source: 'live-aggregated' 
    });

  } catch (error) {
    console.error('Trend API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
