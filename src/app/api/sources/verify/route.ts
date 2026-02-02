import { NextRequest, NextResponse } from 'next/server';
import { sbServer } from '@/infrastructure/supabase/server';
import { SourceInputSchema } from '@/shared/validators/sources';

export async function POST(request: NextRequest) {
  try {
    const supabase = await sbServer();
    
    // Get the current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, reason: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = SourceInputSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          ok: false, 
          reason: 'Invalid source data',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const sourceData = validationResult.data;

    // Check for duplicates
    const duplicateCheck = await supabase
      .from('sources')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', sourceData.type)
      .eq('handle', sourceData.handle || '')
      .eq('url', sourceData.url || '')
      .single();

    if (duplicateCheck.data) {
      return NextResponse.json({
        ok: false,
        reason: 'This source already exists'
      }, { status: 409 });
    }

    // For RSS and blog sources, we could add additional validation here
    // such as checking if the URL is accessible or if it's a valid RSS feed
    
    return NextResponse.json({ 
      ok: true,
      meta: {
        message: 'Source verified successfully',
        source_type: sourceData.type
      }
    });
  } catch (error) {
    console.error('Unexpected error in verify source API:', error);
    return NextResponse.json(
      { 
        ok: false, 
        reason: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
