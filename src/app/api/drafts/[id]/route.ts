import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const UpdateDraftSchema = z.object({
  platform: z.enum(['x', 'linkedin', 'instagram']).optional(),
  content: z.string().min(1, 'Content is required').optional(),
  title: z.string().optional(),
  firstComment: z.string().optional(),
  threads: z.array(z.object({
    id: z.string(),
    content: z.string(),
    characterCount: z.number()
  })).optional(),
  status: z.enum(['generated', 'reviewed', 'accepted', 'rejected']).optional(),
});

// GET single draft
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const { data: draft, error: fetchError } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Draft not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch draft' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      draft
    });

  } catch (error) {
    console.error('Get draft error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE draft
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const body = await request.json();
    const validation = UpdateDraftSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.message },
        { status: 400 }
      );
    }

    const { platform, content, title, firstComment, threads, status } = validation.data;

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (platform) updateData.platform = platform;
    if (content) updateData.content = content;
    if (status) updateData.status = status;

    // Update metadata if additional fields are provided
    if (title !== undefined || firstComment !== undefined || threads !== undefined) {
      // First get current metadata
      const { data: currentDraft } = await supabase
        .from('drafts')
        .select('metadata')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

      const currentMetadata = (currentDraft?.metadata as any) || {};
      
      updateData.metadata = {
        ...currentMetadata,
        ...(title !== undefined && { title }),
        ...(firstComment !== undefined && { firstComment }),
        ...(threads !== undefined && { threads }),
        updatedAt: new Date().toISOString(),
      };
    }

    const { data: updatedDraft, error: updateError } = await supabase
      .from('drafts')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating draft:', updateError);
      return NextResponse.json(
        { error: 'Failed to update draft' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      draft: updatedDraft,
      message: 'Draft updated successfully'
    });

  } catch (error) {
    console.error('Update draft error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const { error: deleteError } = await supabase
      .from('drafts')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting draft:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete draft' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Draft deleted successfully'
    });

  } catch (error) {
    console.error('Delete draft error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
