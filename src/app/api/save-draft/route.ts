import { NextRequest, NextResponse } from 'next/server';
import { sbServer } from '@/lib/supabase/server';
import { z } from 'zod';

const SaveDraftSchema = z.object({
  platform: z.enum(['x', 'linkedin', 'instagram']),
  content: z.string().min(1, 'Content is required'),
  based_on: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

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
    const validationResult = SaveDraftSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { platform, content, based_on, metadata } = validationResult.data;

    // Insert the draft into the database
    const { data: draft, error } = await supabase
      .from('drafts')
      .insert({
        user_id: user.id,
        platform,
        content,
        based_on,
        metadata,
        status: 'generated'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving draft:', error);
      return NextResponse.json(
        { error: 'Failed to save draft' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      draft,
      message: 'Draft saved successfully' 
    });
  } catch (error) {
    console.error('Unexpected error in save draft API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
