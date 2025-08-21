import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const SaveDraftSchema = z.object({
  platform: z.enum(['x', 'linkedin', 'instagram']),
  content: z.string().min(1, 'Content is required'),
  title: z.string().optional(),
  firstComment: z.string().optional(),
  threads: z.array(z.object({
    id: z.string(),
    content: z.string(),
    characterCount: z.number()
  })).optional(),
  originalTopic: z.string().optional(),
  imageUrl: z.string().url().optional(),
  generatedImageUrl: z.string().url().optional(),
});

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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2) Parse and validate request body
    const body = await request.json();
    const validation = SaveDraftSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.message },
        { status: 400 }
      );
    }

    const { platform, content, title, firstComment, threads, originalTopic, imageUrl, generatedImageUrl } = validation.data;

    // 3) Prepare draft data
    const draftData = {
      user_id: user.id,
      platform,
      content,
      status: 'generated' as const,
      metadata: {
        title,
        firstComment,
        threads,
        originalTopic,
        imageUrl,
        generatedImageUrl,
        savedAt: new Date().toISOString(),
      }
    };

    // 4) Save draft to database
    const { data: savedDraft, error: saveError } = await supabase
      .from('drafts')
      .insert(draftData)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving draft:', saveError);
      return NextResponse.json(
        { error: 'Failed to save draft' },
        { status: 500 }
      );
    }

    // 5) Return success response
    return NextResponse.json({
      ok: true,
      draft: savedDraft,
      message: 'Draft saved successfully'
    });

  } catch (error) {
    console.error('Save draft error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
