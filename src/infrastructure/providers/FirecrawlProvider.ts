import { ITrendProvider, TrendContext } from '../../core/domain/interfaces/ITrendProvider';
import { Trend } from '../../core/domain/entities';
import FirecrawlApp from '@mendable/firecrawl-js';

export class FirecrawlProvider implements ITrendProvider {
  name = 'firecrawl';
  private app: FirecrawlApp;

  constructor() {
    this.app = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY || ''
    });
  }

  async fetchTrends(context: TrendContext): Promise<Trend[]> {
    const { niche, geo } = context;

    try {
      const query = context.topic || ``;

      console.log('Firecrawl query:', query);

      // Using the search method as implied by user's feedback
      const searchResponse = await this.app.search(query, {
        limit: 5,
        sources: ['web', 'news'],
        scrapeOptions: {
          formats: ['markdown'],
        }
      });

      // Based on type definition, searchResponse has web, news, and images arrays
      const results = [...(searchResponse.news || []), ...(searchResponse.web || [])];

      if (results.length === 0) {
        console.warn('Firecrawl returned no results');
      }

      return results.map((r: any, index: number) => ({
        topic: r.title || r.metadata?.title || 'Unknown',
        description: r.description || r.metadata?.description || r.snippet || 'No description',
        score: 80 - (index * 5),
        source: 'firecrawl',
        url: r.url || r.metadata?.url,
        timestamp: new Date()
      }));

    } catch (error) {
      console.error('FirecrawlProvider error:', error);
      return [];
    }
  }
}
