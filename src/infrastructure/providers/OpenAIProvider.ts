
import { ITrendProvider, TrendContext } from '../../core/domain/interfaces/ITrendProvider';
import { Trend } from '../../core/domain/entities';
import OpenAI from 'openai';

export class OpenAIProvider implements ITrendProvider {
  name = 'openai';
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async fetchTrends(context: TrendContext): Promise<Trend[]> {
    const { niche, audience, geo } = context;

    let prompt;
    if (context.topic) {
       prompt = `
        Identify 5 trending topics related to: '${context.topic}'.
        If '${context.topic}' is a general query (e.g., 'what is trending'), find broad global trends.
        
        Return JSON: { "trends": [{"topic": "...", "description": "...", "score": 1-100}] }
       `;
    } else {
       prompt = `
        Identify 5 trending topics for:
        - Niche: ${niche}
        - Audience: ${audience}
        - Geo: ${geo}
        
        Return JSON: { "trends": [{"topic": "...", "description": "...", "score": 1-100}] }
      `;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: 'Return JSON only.' }, { role: 'user', content: prompt }],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content || '{}');
      const trends = parsed.trends || [];

      return trends.map((t: any) => ({
        topic: t.topic,
        description: t.description,
        score: t.score,
        source: 'openai',
        timestamp: new Date()
      }));

    } catch (error) {
      console.error('OpenAIProvider error:', error);
      return [];
    }
  }
}
