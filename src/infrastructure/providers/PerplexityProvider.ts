
import { ITrendProvider, TrendContext } from '../../core/domain/interfaces/ITrendProvider';
import { Trend } from '../../core/domain/entities';

export class PerplexityProvider implements ITrendProvider {
  name = 'perplexity';

  async fetchTrends(context: TrendContext): Promise<Trend[]> {
    const { niche, audience, geo } = context;
    
    const prompt = `Identify 5 currently trending topics for ${niche} targeting ${audience} in ${geo}. Return strictly JSON: { "trends": [{"topic": "...", "description": "...", "score": 85}] }`;

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-reasoning-pro',
          messages: [
            { role: 'system', content: 'Return JSON only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1
        }),
      });

      if (!response.ok) throw new Error(`Perplexity API error: ${response.statusText}`);

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.replace(/```json\n?|\n?```/g, '');
      const parsed = JSON.parse(content || '{}');
      const trends = parsed.trends || [];

      return trends.map((t: any) => ({
        topic: t.topic,
        description: t.description,
        score: t.score,
        source: 'perplexity',
        timestamp: new Date()
      }));

    } catch (error) {
      console.error('PerplexityProvider error:', error);
      return [];
    }
  }
}
