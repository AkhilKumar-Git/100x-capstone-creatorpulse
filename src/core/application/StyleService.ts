
import { IVectorStore } from '../domain/interfaces/IVectorStore';
import { StyleProfile } from '../domain/entities';

export class StyleService {
  private vectorStore: IVectorStore;

  constructor(vectorStore: IVectorStore) {
    this.vectorStore = vectorStore;
  }

  async addStyleSample(userId: string, platform: string, text: string): Promise<void> {
    // 1. Generate embedding
    const embedding = await this.vectorStore.embed(text);

    // 2. Create sample object
    const sample = {
      user_id: userId,
      platform,
      raw_text: text,
      embedding
    };

    // 3. Store in VectorStore (DB)
    await this.vectorStore.add('style_samples', sample);
  }

  async findSimilarStyles(userId: string, platform: string, query: string, limit: number = 3): Promise<string[]> {
    // 1. Generate query embedding
    const queryVector = await this.vectorStore.embed(query);

    // 2. Search
    // Note: The filter implementation depends on the VectorStore concrete class handling it.
    // In our Supabase implementation, we need to ensure the RPC supports filtering by user_id/platform.
    // For now, assuming the RPC handles it or we filter post-fetch (less efficient but safe for small data).
    
    // Actually, Supabase `match_style_samples` RPC usually hardcodes the query or accepts params.
    // We might need to update the SupabaseVectorStore to pass these specific params 
    // or update the RPC to be more generic.
    
    // For this refactor, we'll assume the VectorStore.search can handle a filter object 
    // that maps to the RPC arguments if we implemented it perfectly generic, 
    // OR we can add a specific method to IVectorStore if needed, but that breaks ISP.
    
    // Let's rely on the filter param we added to IVectorStore.search
    const results = await this.vectorStore.search('style_samples', queryVector, limit, {
      p_user_id: userId, 
      p_platform: platform
    });

    return results.map(r => r.raw_text);
  }
}
