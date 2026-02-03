'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sbClient } from '@/infrastructure/supabase/client';

interface TrendingTopic {
  id: string;
  topic_name: string;
  momentum_score: number;
  description?: string;
  source?: string;
  source_ids: string[];
  created_at: string;
  updated_at?: string;
}

interface Source {
  id: string;
  type: string;
  handle?: string;
  url?: string;
  name: string;
  avatar: string;
}

interface Draft {
  id: string;
  title?: string;
  content: string;
  platform: string;
  status: string;
  created_at: string;
  draft_title?: string | null;
  metadata?: {
    originalTopic?: string;
    title?: string;
  };
}

interface TrendingTopicsResponse {
  topics: TrendingTopic[];
  sources: Source[];
  drafts: Draft[];
  topicsCount: number;
  sourcesCount: number;
  draftsCount: number;
}

export function useTrendingTopics(topic?: string) {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = sbClient();

  const fetchTrendingTopics = useCallback(async (force = false) => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching trending topics...', topic ? `for topic: ${topic}` : '', force ? '(forced)' : '');

      // 1. Check database first for immediate results if not forcing
      if (!force) {
        const today = new Date();
        today.setHours(today.getHours() - 12); // Use 12h cache window

        let query = supabase.from('trend_items')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString())
          .order('score', { ascending: false });

        if (topic) {
          query = query.filter('meta->>query', 'eq', topic);
        } else {
          query = query.or('meta->>query.is.null,meta->>query.eq.""');
        }

        const { data: cached, error: dbError } = await query;

        if (!dbError && cached && cached.length > 0) {
          console.log('Found cached trends in Supabase');
          setTrendingTopics(cached.map((t: any) => ({
            id: t.id,
            topic_name: t.title || 'Untitled',
            momentum_score: t.score || 0,
            description: t.summary || '',
            source: t.source_type || 'database',
            source_ids: [],
            created_at: t.created_at
          })));
          setLoading(false);
          setError(null);
          // We still want to return here, but we might want to "refresh in background" in some apps.
          // For now, if we have cache, we are good.
          return;
        }
      }

      // 2. Fetch from API if no cache or forced
      const url = topic 
        ? `/api/trending-topics?topic=${encodeURIComponent(topic)}${force ? '&force=true' : ''}`
        : `/api/trending-topics${force ? '?force=true' : ''}`;
        
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to fetch trending topics: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      const trends = data.topics || data.trends || [];
      setTrendingTopics(trends);
      setSources(data.sources || []);
      setDrafts(data.drafts || []);
      setError(null);
    } catch (err) {
      console.error('Error in fetchTrendingTopics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trending topics');
    } finally {
      setLoading(false);
    }
  }, [user, topic, supabase]);

  const refreshTopics = useCallback(() => {
    fetchTrendingTopics(true);
  }, [fetchTrendingTopics]);

  useEffect(() => {
    fetchTrendingTopics(false);
  }, [fetchTrendingTopics]);

  return {
    trendingTopics,
    sources,
    drafts,
    loading,
    error,
    refreshTopics
  };
}
