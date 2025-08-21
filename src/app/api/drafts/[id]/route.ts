import { NextRequest, NextResponse } from 'next/server';
import { sbServer } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const draftId = params.id;

    // First verify the draft belongs to the current user
    const { data: existingDraft, error: fetchError } = await supabase
      .from('drafts')
      .select('id, user_id')
      .eq('id', draftId)
      .single();

    if (fetchError || !existingDraft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    if (existingDraft.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete the draft
    const { error: deleteError } = await supabase
      .from('drafts')
      .delete()
      .eq('id', draftId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting draft:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete draft' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in draft delete API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
