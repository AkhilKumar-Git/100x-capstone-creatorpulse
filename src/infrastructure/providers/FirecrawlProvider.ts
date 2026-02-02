
import { ITrendProvider, TrendContext } from '../../core/domain/interfaces/ITrendProvider';
import { Trend } from '../../core/domain/entities';

export class FirecrawlProvider implements ITrendProvider {
  name = 'firecrawl';

  async fetchTrends(context: TrendContext): Promise<Trend[]> {
    const { niche, geo } = context;

    try {
      const query = context.topic 
        ? `trending news ${context.topic} ${geo}`
        : `trending news ${niche} ${geo}`;

      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          limit: 5,
          pageOptions: { fetchPageContent: false }
        }),
      });

      if (!response.ok) throw new Error(`Firecrawl API error: ${response.statusText}`);

      const data = await response.json();
      const results = data.data || [];

      return results.map((r: any, index: number) => ({
        topic: r.title || 'Unknown',
        description: r.description || 'No description',
        score: 80 - (index * 5),
        source: 'firecrawl',
        url: r.url,
        timestamp: new Date()
      }));

    } catch (error) {
      console.error('FirecrawlProvider error:', error);
      return [];
    }
  }
}
