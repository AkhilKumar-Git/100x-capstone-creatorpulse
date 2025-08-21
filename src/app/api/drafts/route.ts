import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2) Get query parameters for pagination and filtering
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const platform = url.searchParams.get('platform');

    // 3) Build query
    let query = supabase
      .from('drafts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (platform) {
      query = query.eq('platform', platform);
    }

    // 4) Execute query
    const { data: drafts, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching drafts:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch drafts' },
        { status: 500 }
      );
    }

    // 5) Return drafts
    return NextResponse.json({
      ok: true,
      drafts,
      pagination: {
        limit,
        offset,
        hasMore: drafts.length === limit
      }
    });

  } catch (error) {
    console.error('Fetch drafts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
