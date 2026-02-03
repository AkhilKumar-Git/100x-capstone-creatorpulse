'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface TrendingTopic {
  id: string;
  topic_name: string;
  momentum_score: number;
  description?: string;
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

  const fetchTrendingTopics = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Fetching trending topics...', topic ? `for topic: ${topic}` : '');
      const url = topic 
        ? `/api/trending-topics?topic=${encodeURIComponent(topic)}`
        : '/api/trending-topics';
        
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to fetch trending topics: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      setTrendingTopics(data.topics || data.trends || []);
      setSources(data.sources || []);
      setDrafts(data.drafts || []);
      setError(null);
    } catch (err) {
      console.error('Error in fetchTrendingTopics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trending topics');
      setTrendingTopics([]);
      setSources([]);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, [user, topic]);

  const refreshTopics = useCallback(() => {
    setLoading(true);
    fetchTrendingTopics();
  }, [fetchTrendingTopics]);

  useEffect(() => {
    fetchTrendingTopics();
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
