'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface TrendingTopic {
  id: string;
  topic_name: string;
  topic_summary: string;
  momentum_score: number;
  source_count: number;
  source_icons: SourceIcon[];
  last_updated: string;
  metrics: {
    engagement_rate: number;
    velocity_score: number;
    reach_multiplier: number;
    mentions_count: number;
    sentiment_score: number;
    trending_duration: number;
  };
  source_type: string;
  source_ref: string;
}

export interface SourceIcon {
  id: string;
  type: 'x' | 'youtube' | 'rss' | 'blog';
  handle?: string;
  url?: string;
  avatar_url?: string;
}

export interface PersonalDraft {
  id: string;
  platform: 'x' | 'linkedin' | 'instagram';
  content: string;
  based_on: string | null;
  status: 'generated' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const useTrendingTopics = () => {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [personalDrafts, setPersonalDrafts] = useState<PersonalDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTrendingTopics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch trending topics from your sources
      const response = await fetch('/api/trending-topics');
      if (!response.ok) {
        throw new Error('Failed to fetch trending topics');
      }
      
      const data = await response.json();
      setTrendingTopics(data.topics || []);
      setPersonalDrafts(data.drafts || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trending topics');
      console.error('Error fetching trending topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingTopics();
  }, [user]);

  const refreshTopics = () => {
    fetchTrendingTopics();
  };

  return {
    trendingTopics,
    personalDrafts,
    loading,
    error,
    refreshTopics,
  };
};
