import { YoutubeTranscript } from 'youtube-transcript';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  transcript?: string;
  duration: string;
  tags: string[];
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  latestVideos: YouTubeVideo[];
}

export class YouTubeIngestion {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getChannelInfo(channelId: string): Promise<YouTubeChannel | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        return null;
      }

      const channel = data.items[0];
      return {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        subscriberCount: channel.statistics.subscriberCount || '0',
        videoCount: channel.statistics.videoCount || '0',
        latestVideos: []
      };
    } catch (error) {
      console.error('Error fetching channel info:', error);
      return null;
    }
  }

  async getLatestVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=${maxResults}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.items) {
        return [];
      }

      // Get video IDs for detailed info
      const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
      
      // Fetch detailed video information
      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${this.apiKey}`
      );

      if (!videoResponse.ok) {
        throw new Error(`YouTube API error: ${videoResponse.status}`);
      }

      const videoData = await videoResponse.json();
      if (!videoData.items) {
        return [];
      }

      const videos: YouTubeVideo[] = await Promise.all(
        videoData.items.map(async (video: any) => {
          // Try to get transcript
          let transcript = '';
          try {
            const transcriptItems = await YoutubeTranscript.fetchTranscript(video.id);
            transcript = transcriptItems.map((item: any) => item.text).join(' ');
          } catch (transcriptError) {
            console.log(`No transcript available for video ${video.id}`);
          }

          return {
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            publishedAt: video.snippet.publishedAt,
            channelId: video.snippet.channelId,
            channelTitle: video.snippet.channelTitle,
            viewCount: video.statistics.viewCount || '0',
            likeCount: video.statistics.likeCount || '0',
            commentCount: video.statistics.commentCount || '0',
            transcript,
            duration: video.contentDetails.duration,
            tags: video.snippet.tags || []
          };
        })
      );

      return videos;
    } catch (error) {
      console.error('Error fetching latest videos:', error);
      return [];
    }
  }

  async getChannelWithLatestVideos(channelId: string): Promise<YouTubeChannel | null> {
    try {
      const channel = await this.getChannelInfo(channelId);
      if (!channel) return null;

      const latestVideos = await this.getLatestVideos(channelId, 5);
      channel.latestVideos = latestVideos;

      return channel;
    } catch (error) {
      console.error('Error fetching channel with videos:', error);
      return null;
    }
  }

  async analyzeTrendingTopics(videos: YouTubeVideo[]): Promise<any[]> {
    // This would typically call OpenAI to analyze transcripts
    // For now, return basic analysis
    return videos.map(video => ({
      videoId: video.id,
      title: video.title,
      transcript: video.transcript,
      engagement: {
        views: parseInt(video.viewCount),
        likes: parseInt(video.likeCount),
        comments: parseInt(video.commentCount)
      },
      publishedAt: video.publishedAt
    }));
  }
}

// Helper function to extract channel ID from various YouTube URL formats
export function extractChannelId(urlOrHandle: string): string | null {
  // Handle different YouTube URL formats
  const patterns = [
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/@([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]+)$/ // Direct handle
  ];

  for (const pattern of patterns) {
    const match = urlOrHandle.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
