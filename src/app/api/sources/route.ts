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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = SourceInputSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid source data',
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
        error: 'This source already exists'
      }, { status: 409 });
    }

    // Insert new source
    const { data, error } = await supabase
      .from('sources')
      .insert({
        user_id: user.id,
        type: sourceData.type,
        handle: sourceData.handle || null,
        url: sourceData.url || null,
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating source:', error);
      return NextResponse.json(
        { error: 'Failed to create source' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Source created successfully' 
    });
  } catch (error) {
    console.error('Unexpected error in create source API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Get all sources for the user
    const { data: sources, error } = await supabase
      .from('sources')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sources:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sources' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: sources,
      message: 'Sources fetched successfully' 
    });
  } catch (error) {
    console.error('Unexpected error in fetch sources API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
