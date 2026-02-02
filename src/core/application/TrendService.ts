
import { ITrendProvider, TrendContext } from '../domain/interfaces/ITrendProvider';
import { IVectorStore } from '../domain/interfaces/IVectorStore';
import { Trend } from '../domain/entities';

export class TrendService {
  private providers: ITrendProvider[];
  private vectorStore: IVectorStore;

  constructor(providers: ITrendProvider[], vectorStore: IVectorStore) {
    this.providers = providers;
    this.vectorStore = vectorStore;
  }

  async discoverTrends(context: TrendContext): Promise<Trend[]> {
    console.log('Starting trend discovery with providers:', this.providers.map(p => p.name));
    
    // 1. Fetch from all providers in parallel
    const fetchPromises = this.providers.map(async (provider) => {
      try {
        return await provider.fetchTrends(context);
      } catch (error) {
        console.error(`Error fetching from ${provider.name}:`, error);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    const allTrends = results.flat();
    
    if (allTrends.length === 0) return [];

    // 2. Unification & Scoring
    return this.unifyTrends(allTrends);
  }

  private async unifyTrends(trends: Trend[]): Promise<Trend[]> {
    // For now, simple de-duplication based on topic name similarity
    // In future: Use vectorStore.embed(trend.topic) to cluster semantically
    
    const unified: Trend[] = [];
    const seen = new Set<string>();

    // Weight sources
    const weights: Record<string, number> = {
      'perplexity': 1.2,
      'firecrawl': 1.1,
      'openai': 1.0
    };

    // Sort by initial score * weight
    const sorted = trends.sort((a, b) => {
      const scoreA = a.score * (weights[a.source] || 1);
      const scoreB = b.score * (weights[b.source] || 1);
      return scoreB - scoreA;
    });

    for (const trend of sorted) {
      const normalizedTopic = trend.topic.toLowerCase().trim();
      
      // Simple check to see if we already have this topic
      // A more robust system would use embeddings here to check semantic distance
      // e.g. await this.vectorStore.search('trends_cache', await this.vectorStore.embed(trend.topic)...)
      
      if (!seen.has(normalizedTopic)) {
        seen.add(normalizedTopic);
        unified.push(trend);
      }
    }

    return unified.slice(0, 5); // Return top 5
  }
}
