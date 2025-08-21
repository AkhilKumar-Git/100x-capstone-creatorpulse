import { sbServer } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

const OPENAI_URL = "https://api.openai.com/v1/embeddings";
const MODEL = "text-embedding-3-small";

async function embedQuery(text: string) {
  const r = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY!}` },
    body: JSON.stringify({ model: MODEL, input: text })
  });
  const j = await r.json();
  return j.data[0].embedding as number[];
}

export async function getStyleFewShots(userId: string, platform: "x"|"linkedin"|"instagram", about: string, k = 4) {
  try {
    console.log(`🔍 Getting style samples for user ${userId}, platform ${platform}, topic: "${about}"`);
    
    const emb = await embedQuery(about);
    console.log(`📊 Generated embedding with ${emb.length} dimensions`);

    const sb = await sbServer();

    // First, let's check if the user has any style samples for this platform
    const { data: sampleCount, error: countError } = await sb
      .from("style_samples")
      .select("id", { count: 'exact' })
      .eq("user_id", userId)
      .eq("platform", platform);

    if (countError) {
      console.error('Error checking sample count:', countError);
      throw countError;
    }

    console.log(`📊 User has ${sampleCount?.length || 0} style samples for platform ${platform}`);

    if (!sampleCount || sampleCount.length === 0) {
      console.log(`⚠️ No style samples found for platform ${platform}, returning empty array`);
      return [];
    }

    const { data, error } = await sb.rpc("match_style_samples", {
      p_user_id: userId,
      p_platform: platform,
      p_query_embedding: emb,
      p_match_count: k
    });

    if (error) {
      console.error('Database function error:', error);
      throw error;
    }
    
    // Type-safe return using the database function return type
    const results = data as Database['public']['Functions']['match_style_samples']['Returns'] | null;
    const styleTexts = (results ?? []).map((r) => r.raw_text);
    
    console.log(`✅ Retrieved ${styleTexts.length} style samples for platform ${platform}`);
    return styleTexts;
  } catch (error) {
    console.error('Error in getStyleFewShots:', error);
    throw error;
  }
}
