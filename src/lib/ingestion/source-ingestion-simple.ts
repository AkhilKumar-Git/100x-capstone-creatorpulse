export interface IngestedContent {
  id: string;
  source_id: string;
  source_type: 'x' | 'youtube' | 'rss' | 'blog';
  content: string;
  title?: string;
  published_at: string;
  engagement_metrics: {
    views?: number;
    likes?: number;
    retweets?: number;
    comments?: number;
    shares?: number;
  };
  metadata: Record<string, unknown>;
  source_active: boolean;
}

export interface TrendingAnalysis {
  topic: string;
  summary: string;
  momentum_score: number;
  metrics: {
    engagement_rate: number;
    velocity_score: number;
    reach_multiplier: number;
    mentions_count: number;
    sentiment_score: number;
    trending_duration: number;
  };
  contributing_sources: string[];
  source_type: string;
  source_ref: string;
}

export class SimpleSourceIngestionService {
  async ingestFromSources(sources: Array<{
    id: string;
    type: 'x' | 'youtube' | 'blog' | 'rss';
    handle?: string;
    url?: string;
    active: boolean;
  }>): Promise<IngestedContent[]> {
    const allContent: IngestedContent[] = [];

    // Filter only active sources
    const activeSources = sources.filter(source => source.active === true);
    
    if (activeSources.length === 0) {
      console.log('No active sources found for ingestion');
      return allContent;
    }

    console.log(`Ingesting from ${activeSources.length} active sources`);

    // For now, return mock content to demonstrate the active source filtering
    // In production, this would call the actual ingestion services
    for (const source of activeSources) {
      const mockContent: IngestedContent = {
        id: `mock_${source.id}`,
        source_id: source.id,
        source_type: source.type,
        content: `Mock content from ${source.type} source ${source.handle || source.url}`,
        title: `Mock ${source.type} content`,
        published_at: new Date().toISOString(),
        engagement_metrics: {
          likes: Math.floor(Math.random() * 100),
          views: Math.floor(Math.random() * 1000),
          comments: Math.floor(Math.random() * 50)
        },
        metadata: {
          source_type: source.type,
          source_handle: source.handle,
          source_url: source.url,
          mock: true
        },
        source_active: true
      };

      allContent.push(mockContent);
    }

    return allContent;
  }

  async analyzeTrendingTopics(content: IngestedContent[]): Promise<TrendingAnalysis[]> {
    // Simple topic extraction based on content patterns
    const topics = this.extractTopicsFromContent(content);
    const analyses: TrendingAnalysis[] = [];

    for (const topic of topics) {
      const topicContent = content.filter(item => 
        item.content.toLowerCase().includes(topic.toLowerCase())
      );

      const metrics = this.calculateTrendingMetrics(topicContent, topic);
      
      analyses.push({
        topic,
        summary: `Trending topic identified from ${topicContent.length} content pieces`,
        momentum_score: metrics.momentum_score,
        metrics,
        contributing_sources: [...new Set(topicContent.map(item => item.source_id))],
        source_type: 'mixed',
        source_ref: topic
      });
    }

    return analyses.sort((a, b) => b.momentum_score - a.momentum_score);
  }

  private extractTopicsFromContent(content: IngestedContent[]): string[] {
    // Simple topic extraction - in production, use OpenAI for better analysis
    const allText = content.map(item => item.content).join(' ');
    const hashtags = this.extractHashtags(allText);
    const words = allText.toLowerCase().split(/\s+/);
    
    // Count word frequency and identify potential topics
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      if (word.length > 3 && !this.isStopWord(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    const topics = Object.entries(wordCount)
      .filter(([_, count]) => count > 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([word, _]) => word);

    return [...new Set([...hashtags, ...topics])];
  }

  private calculateTrendingMetrics(content: IngestedContent[], topic: string): TrendingAnalysis['metrics'] & { momentum_score: number } {
    const totalEngagement = content.reduce((sum, item) => {
      const engagement = item.engagement_metrics;
      return sum + (engagement.likes || 0) + (engagement.retweets || 0) + (engagement.comments || 0);
    }, 0);

    const avgEngagement = totalEngagement / Math.max(content.length, 1);
    const velocity = content.length; // Number of mentions
    const reach = content.reduce((sum, item) => sum + (item.engagement_metrics.views || 0), 0);

    const momentum_score = Math.min(
      (avgEngagement * 0.3) + (velocity * 10 * 0.25) + (reach / 1000 * 0.2) + (velocity * 2 * 0.15) + (50 * 0.1),
      100
    );

    return {
      engagement_rate: Math.min(avgEngagement / 100, 100),
      velocity_score: Math.min(velocity * 10, 100),
      reach_multiplier: Math.min(reach / 1000, 100),
      mentions_count: content.length,
      sentiment_score: 50, // Placeholder
      trending_duration: 1, // Placeholder
      momentum_score
    };
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  }

  private extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(mention => mention.slice(1)) : [];
  }

  private extractUrls(text: string): string[] {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const matches = text.match(urlRegex);
    return matches || [];
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];
    return stopWords.includes(word);
  }
}
