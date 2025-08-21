import { YouTubeIngestion, extractChannelId } from './youtube';
import { XIngestion } from './x';
import { RSSIngestion } from './rss';
import { crawlSite } from './firecrawl';

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
  source_active: boolean; // Track if source was active when ingested
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

export class SourceIngestionService {
  private youtubeIngestion: YouTubeIngestion;
  private xIngestion: XIngestion;
  private rssIngestion: RSSIngestion;
  private firecrawlIngestion: FirecrawlIngestion;

  constructor() {
    this.youtubeIngestion = new YouTubeIngestion(process.env.YOUTUBE_API_KEY!);
    this.xIngestion = new XIngestion();
    this.rssIngestion = new RSSIngestion();
    this.firecrawlIngestion = new FirecrawlIngestion();
  }

  async ingestFromSources(sources: Array<{
    id: string;
    type: 'x' | 'youtube' | 'rss' | 'blog';
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

    for (const source of activeSources) {
      try {
        let content: IngestedContent[] = [];

        switch (source.type) {
          case 'x':
            if (source.handle) {
              content = await this.ingestXSource(source.id, source.handle);
            }
            break;

          case 'youtube':
            if (source.handle) {
              content = await this.ingestYouTubeSource(source.id, source.handle);
            }
            break;

          case 'rss':
            if (source.url) {
              content = await this.ingestRSSSource(source.id, source.url);
            }
            break;

          case 'blog':
            if (source.url) {
              content = await this.ingestBlogSource(source.id, source.url);
            }
            break;
        }

        allContent.push(...content);
      } catch (error) {
        console.error(`Error ingesting from source ${source.id}:`, error);
      }
    }

    return allContent;
  }

  private async ingestXSource(sourceId: string, handle: string): Promise<IngestedContent[]> {
    try {
      const tweets = await this.xIngestion.getLatestTweets(handle, 20);
      
      return tweets.map((tweet: any) => ({
        id: `x_${tweet.id}`,
        source_id: sourceId,
        source_type: 'x' as const,
        content: tweet.text,
        published_at: tweet.created_at,
        engagement_metrics: {
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          comments: tweet.public_metrics?.reply_count || 0,
          shares: tweet.public_metrics?.quote_count || 0
        },
        metadata: {
          tweet_id: tweet.id,
          author_id: tweet.author_id,
          hashtags: this.extractHashtags(tweet.text),
          mentions: this.extractMentions(tweet.text),
          urls: this.extractUrls(tweet.text)
        },
        source_active: true
      }));
    } catch (error) {
      console.error('Error ingesting X source:', error);
      return [];
    }
  }

  private async ingestYouTubeSource(sourceId: string, handle: string): Promise<IngestedContent[]> {
    try {
      const channelId = extractChannelId(handle);
      if (!channelId) {
        console.error('Invalid YouTube handle:', handle);
        return [];
      }

      const channel = await this.youtubeIngestion.getChannelWithLatestVideos(channelId);
      if (!channel) return [];

      return channel.latestVideos.map((video: any) => ({
        id: `yt_${video.id}`,
        source_id: sourceId,
        source_type: 'youtube' as const,
        content: video.transcript || video.description,
        title: video.title,
        published_at: video.publishedAt,
        engagement_metrics: {
          views: parseInt(video.viewCount),
          likes: parseInt(video.likeCount),
          comments: parseInt(video.commentCount)
        },
        metadata: {
          video_id: video.id,
          channel_id: video.channelId,
          channel_title: video.channelTitle,
          duration: video.duration,
          tags: video.tags,
          has_transcript: !!video.transcript
        },
        source_active: true
      }));
    } catch (error) {
      console.error('Error ingesting YouTube source:', error);
      return [];
    }
  }

  private async ingestRSSSource(sourceId: string, url: string): Promise<IngestedContent[]> {
    try {
      const articles = await this.rssIngestion.getLatestArticles(url, 20);
      
      return articles.map((article: any) => ({
        id: `rss_${article.guid || article.link}`,
        source_id: sourceId,
        source_type: 'rss' as const,
        content: article.content || article.description,
        title: article.title,
        published_at: article.pubDate,
        engagement_metrics: {},
        metadata: {
          link: article.link,
          author: article.author,
          categories: article.categories,
          content_length: article.content?.length || 0
        },
        source_active: true
      }));
    } catch (error) {
      console.error('Error ingesting RSS source:', error);
      return [];
    }
  }

  private async ingestBlogSource(sourceId: string, url: string): Promise<IngestedContent[]> {
    try {
      const content = await this.firecrawlIngestion.scrapeUrl(url);
      
      return [{
        id: `blog_${sourceId}`,
        source_id: sourceId,
        source_type: 'blog' as const,
        content: content.text || content.html || '',
        title: content.title,
        published_at: new Date().toISOString(),
        engagement_metrics: {},
        metadata: {
          url: url,
          title: content.title,
          content_length: content.text?.length || 0,
          scraped_at: new Date().toISOString()
        },
        source_active: true
      }];
    } catch (error) {
      console.error('Error ingesting blog source:', error);
      return [];
    }
  }

  async analyzeTrendingTopics(content: IngestedContent[]): Promise<TrendingAnalysis[]> {
    // This would typically call OpenAI to analyze content and identify trends
    // For now, return a simplified analysis based on content patterns
    
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
        momentum_score: (metrics.engagement_rate + metrics.velocity_score + metrics.reach_multiplier) / 3,
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

  private calculateTrendingMetrics(content: IngestedContent[], topic: string): TrendingAnalysis['metrics'] {
    const totalEngagement = content.reduce((sum, item) => {
      const engagement = item.engagement_metrics;
      return sum + (engagement.likes || 0) + (engagement.retweets || 0) + (engagement.comments || 0);
    }, 0);

    const avgEngagement = totalEngagement / Math.max(content.length, 1);
    const velocity = content.length; // Number of mentions
    const reach = content.reduce((sum, item) => sum + (item.engagement_metrics.views || 0), 0);

    return {
      engagement_rate: Math.min(avgEngagement / 100, 100), // Normalize to 0-100
      velocity_score: Math.min(velocity * 10, 100), // Normalize to 0-100
      reach_multiplier: Math.min(reach / 1000, 100), // Normalize to 0-100
      mentions_count: content.length,
      sentiment_score: 50, // Placeholder - would use OpenAI sentiment analysis
      trending_duration: 1 // Placeholder - would track how long topic has been trending
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
