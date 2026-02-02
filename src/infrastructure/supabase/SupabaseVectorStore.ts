
import { IVectorStore } from '../../core/domain/interfaces/IVectorStore';
import { sbServer } from '@/infrastructure/supabase/server';
import OpenAI from 'openai';

export class SupabaseVectorStore implements IVectorStore {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  }

  async search(collection: string, vector: number[], limit: number, filter?: Record<string, any>): Promise<any[]> {
    const supabase = await sbServer();
    
    // Using a dynamic RPC call or direct query depending on the collection
    // For now assuming we have specific match functions or using a generic approach if possible.
    // In a real robust app, we'd map 'collection' to specific tables/functions.
    
    // Example for 'style_samples'
    if (collection === 'style_samples') {
      // Map filter to specific RPC args
      const rpcArgs: any = {
        p_query_embedding: vector,
        p_match_count: limit
      };

      if (filter && filter.p_user_id) rpcArgs.p_user_id = filter.p_user_id;
      if (filter && filter.p_platform) rpcArgs.p_platform = filter.p_platform;

      const { data, error } = await supabase.rpc('match_style_samples', rpcArgs);

      if (error) throw error;
      return data || [];
    }

    throw new Error(`Collection ${collection} not supported yet in SupabaseVectorStore`);
  }

  async add(collection: string, item: any): Promise<void> {
    const supabase = await sbServer();
    const { error } = await supabase.from(collection).insert(item);
    if (error) throw error;
  }
}
