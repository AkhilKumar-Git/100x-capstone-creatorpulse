import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Rate limiting in memory (in production, use Redis or similar)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds

// Environment validation
const SUPABASE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_FUNCTIONS_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL is not set');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
}

// Request body validation schema
const GenerateBodySchema = z.object({
  sourceIds: z.array(z.number()).optional(),
  includePlatforms: z.array(z.enum(['x', 'youtube', 'blog', 'rss'])).optional(),
});

type GenerateBody = z.infer<typeof GenerateBodySchema>;

// Edge Function response type
interface EdgeFunctionResponse {
  ok: boolean;
  trends?: number;
  drafts?: number;
  message?: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    // 1) Auth - Get current user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
                  set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // The `delete` method was called from a Server Component.
          }
        },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, reason: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2) Rate limiting
    const now = Date.now();
    const lastRequest = rateLimitMap.get(user.id);
    
    if (lastRequest && (now - lastRequest) < RATE_LIMIT_WINDOW) {
      return NextResponse.json(
        { ok: false, reason: 'Rate limit exceeded. Please wait 60 seconds between requests.' },
        { status: 429 }
      );
    }
    
    rateLimitMap.set(user.id, now);

    // 3) Read and validate request body
    let body: GenerateBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, reason: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const validationResult = GenerateBodySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { ok: false, reason: 'Invalid request body', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { sourceIds, includePlatforms } = validationResult.data;

    // 4) Query active sources for user
    let query = supabase
      .from('sources')
      .select('id, type, handle, url, active')
      .eq('user_id', user.id)
      .eq('active', true);

    // Apply source ID filter if provided
    if (sourceIds && sourceIds.length > 0) {
      query = query.in('id', sourceIds);
    }

    // Apply platform filter if provided
    if (includePlatforms && includePlatforms.length > 0) {
      query = query.in('type', includePlatforms);
    }

    const { data: sources, error: sourcesError } = await query;

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
      return NextResponse.json(
        { ok: false, reason: 'Failed to fetch sources' },
        { status: 500 }
      );
    }

    if (!sources || sources.length === 0) {
      return NextResponse.json(
        { ok: false, reason: 'No active sources found' },
        { status: 400 }
      );
    }

    // 5) Map sources into the format expected by Edge Function
    const x_handles: string[] = [];
    const youtube_channel_ids: string[] = [];
    const blog_urls: string[] = [];
    const rss_urls: string[] = [];

    sources.forEach(source => {
      switch (source.type) {
        case 'x':
          if (source.handle) {
            // Remove @ if present and normalize
            x_handles.push(source.handle.replace(/^@/, ''));
          }
          break;
        case 'youtube':
          if (source.handle) {
            youtube_channel_ids.push(source.handle);
          }
          break;
        case 'blog':
          if (source.url) {
            blog_urls.push(source.url);
          }
          break;
        case 'rss':
          if (source.url) {
            rss_urls.push(source.url);
          }
          break;
      }
    });

    // 6) Call Edge Function with enhanced source data
    const edgeFunctionPayload = {
      user_id: user.id,
      x_handles,
      youtube_channel_ids,
      blog_urls,
      rss_urls,
      // Add source metadata for better trend analysis
      sources_metadata: sources.map(source => ({
        id: source.id,
        type: source.type,
        handle: source.handle,
        url: source.url,
        active: source.active
      }))
    };

    const edgeFunctionResponse = await fetch(
      `${SUPABASE_FUNCTIONS_URL}/daily-generate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(edgeFunctionPayload),
      }
    );

    if (!edgeFunctionResponse.ok) {
      const errorText = await edgeFunctionResponse.text();
      console.error('Edge Function error:', errorText);
      return NextResponse.json(
        { 
          ok: false, 
          reason: `Edge Function failed: ${edgeFunctionResponse.status} ${edgeFunctionResponse.statusText}` 
        },
        { status: 500 }
      );
    }

    // 7) Return unified response
    const edgeFunctionData: EdgeFunctionResponse = await edgeFunctionResponse.json();
    
    return NextResponse.json({
      ...edgeFunctionData,
      ok: true, // Override any existing ok property from Edge Function
    });

  } catch (error) {
    console.error('Generate Now error:', error);
    return NextResponse.json(
      { ok: false, reason: 'Internal server error' },
      { status: 500 }
    );
  }
}
