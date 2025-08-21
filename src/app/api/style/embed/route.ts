import { NextResponse } from "next/server";
import { sbServer } from "@/lib/supabase/server";

const MODEL = "text-embedding-3-small";

async function embedBatch(texts: string[]) {
  console.log('Calling OpenAI embeddings API for', texts.length, 'texts');
  
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}` 
    },
    body: JSON.stringify({ model: MODEL, input: texts })
  });
  
  console.log('OpenAI API response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`Embedding failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('OpenAI API success, received', data.data?.length || 0, 'embeddings');
  return data.data.map((d: { embedding: number[] }) => d.embedding);
}

export async function POST(req: Request) {
  try {
    console.log('=== Style Embed API Called ===');
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json({ ok: false, reason: "OpenAI API key not configured" }, { status: 500 });
    }
    
    const supabase = await sbServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('User not authenticated');
      return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
    }
    
    console.log('User authenticated:', user.id);

    const { platform, lines } = await req.json();
    console.log('Request data:', { platform, lines: lines?.length || 0 });
    
    if (!Array.isArray(lines) || !lines.length) {
      return NextResponse.json({ ok: false, reason: "no content provided" }, { status: 400 });
    }

    if (!['x', 'linkedin', 'instagram', 'twitter', 'tiktok', 'youtube', 'blog'].includes(platform)) {
      return NextResponse.json({ ok: false, reason: "invalid platform" }, { status: 400 });
    }

    // Process in chunks of 100 (OpenAI batch limit)
    console.log('Processing', lines.length, 'lines in chunks');
    const chunks: string[][] = [];
    for (let i = 0; i < lines.length; i += 100) {
      chunks.push(lines.slice(i, i + 100));
    }
    console.log('Created', chunks.length, 'chunks');

    const embeddings: number[][] = [];
    for (const chunk of chunks) {
      const chunkEmbeddings = await embedBatch(chunk);
      embeddings.push(...chunkEmbeddings);
    }
    console.log('Total embeddings generated:', embeddings.length);

    // Prepare rows for database
    const rows = lines.map((raw_text: string, i: number) => ({
      user_id: user.id,
      platform,
      raw_text,
      embedding: embeddings[i]
    }));
    console.log('Prepared', rows.length, 'rows for database insertion');

    // Insert into database
    console.log('Inserting into style_samples table...');
    const { data, error } = await supabase
      .from("style_samples")
      .insert(rows)
      .select("id");

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json({ ok: false, reason: error.message }, { status: 400 });
    }
    
    console.log('Database insert successful:', data?.length, 'records created');

    return NextResponse.json({ 
      ok: true, 
      count: data?.length ?? 0,
      message: `Successfully embedded ${data?.length ?? 0} style samples` 
    });

  } catch (error: unknown) {
    console.error('Style embedding error:', error);
    return NextResponse.json(
      { ok: false, reason: error instanceof Error ? error.message : 'Embedding failed' }, 
      { status: 500 }
    );
  }
}
