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
  const emb = await embedQuery(about);

  const sb = await sbServer();

  const { data, error } = await sb.rpc("match_style_samples", {
    p_user_id: userId,
    p_platform: platform,
    p_query_embedding: emb,
    p_match_count: k
  });

  if (error) throw error;
  
  // Type-safe return using the database function return type
  const results = data as Database['public']['Functions']['match_style_samples']['Returns'] | null;
  return (results ?? []).map((r) => r.raw_text);
}
