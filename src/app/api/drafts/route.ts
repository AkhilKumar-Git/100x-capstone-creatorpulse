import { NextRequest, NextResponse } from 'next/server';
import { sbServer } from '@/infrastructure/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await sbServer();
    
    // Get the current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get platform filter from query params
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    // Build the query
    let query = supabase
      .from('drafts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply platform filter if specified
    if (platform && platform !== 'all') {
      query = query.eq('platform', platform);
    }

    const { data: drafts, error } = await query;

    if (error) {
      console.error('Error fetching drafts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch drafts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ drafts: drafts || [] });
  } catch (error) {
    console.error('Unexpected error in drafts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
