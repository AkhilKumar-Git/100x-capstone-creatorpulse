'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache';
import { 
  CreateSourceInputSchema, 
  ToggleSourceInputSchema, 
  DeleteSourceInputSchema, 
  VerifySourceInputSchema,
  type CreateSourceInput,
  type ToggleSourceInput,
  type DeleteSourceInput,
  type VerifySourceInput,
  type SourceRecord,
  getSourceValidationError
} from '@/lib/validators/sources';
import { getUserIdByHandle } from '@/lib/ingestion/x';
import { searchChannelVideos } from '@/lib/ingestion/youtube';
import { fetchRss } from '@/lib/ingestion/rss';
import { extractUrls } from '@/lib/ingestion/firecrawl';

// Database client with RLS support
async function getSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
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
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Get current user ID with better error handling
async function getCurrentUserId(): Promise<string> {
  try {
    const supabase = await getSupabaseClient();
    
    // First try to get the user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user from session:', userError);
      throw new Error('Authentication required');
    }
    
    if (!user) {
      // Try to get user from session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Authentication required');
      }
      
      if (!session?.user) {
        console.error('No user found in session');
        throw new Error('Authentication required');
      }
      
      return session.user.id;
    }
    
    return user.id;
  } catch (error) {
    console.error('Error in getCurrentUserId:', error);
    throw new Error('Authentication required');
  }
}

/**
 * Create a new source
 */
export async function createSource(input: CreateSourceInput): Promise<{ 
  success: boolean; 
  data?: SourceRecord; 
  error?: string; 
  code?: string;
}> {
  try {
    // Validate input
    const validation = CreateSourceInputSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: getSourceValidationError(validation.error)
      };
    }

    const userId = await getCurrentUserId();
    const supabase = await getSupabaseClient();

    // Check for duplicates
    const duplicateCheck = await supabase
      .from('sources')
      .select('id')
      .eq('user_id', userId)
      .eq('type', input.type)
      .eq('handle', input.handle || '')
      .eq('url', input.url || '')
      .single();

    if (duplicateCheck.data) {
      return {
        success: false,
        error: 'This source already exists',
        code: 'DUPLICATE'
      };
    }

    // Insert new source
    const { data, error } = await supabase
      .from('sources')
      .insert({
        user_id: userId,
        type: input.type,
        handle: input.handle || null,
        url: input.url || null,
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating source:', error);
      return {
        success: false,
        error: 'Failed to create source'
      };
    }

    // Revalidate sources page
    revalidatePath('/sources');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: data as SourceRecord
    };

  } catch (error) {
    console.error('Error in createSource:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Delete a source
 */
export async function deleteSource(input: DeleteSourceInput): Promise<{ 
  success: boolean; 
  error?: string; 
}> {
  try {
    // Validate input
    const validation = DeleteSourceInputSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid source ID'
      };
    }

    const userId = await getCurrentUserId();
    const supabase = await getSupabaseClient();

    // Delete source (RLS ensures ownership)
    const { error } = await supabase
      .from('sources')
      .delete()
      .eq('id', input.id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting source:', error);
      return {
        success: false,
        error: 'Failed to delete source'
      };
    }

    // Revalidate sources page
    revalidatePath('/sources');
    revalidatePath('/dashboard');

    return { success: true };

  } catch (error) {
    console.error('Error in deleteSource:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Toggle source active status
 */
export async function toggleSource(input: ToggleSourceInput): Promise<{ 
  success: boolean; 
  error?: string; 
}> {
  try {
    // Validate input
    const validation = ToggleSourceInputSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid input'
      };
    }

    const userId = await getCurrentUserId();
    const supabase = await getSupabaseClient();

    // Update source (RLS ensures ownership)
    const { error } = await supabase
      .from('sources')
      .update({ active: input.active })
      .eq('id', input.id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error toggling source:', error);
      return {
        success: false,
        error: 'Failed to update source'
      };
    }

    // Revalidate sources page
    revalidatePath('/sources');
    revalidatePath('/dashboard');

    return { success: true };

  } catch (error) {
    console.error('Error in toggleSource:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * List user's sources
 */
export async function listSources(): Promise<{ 
  success: boolean; 
  data?: SourceRecord[]; 
  error?: string; 
}> {
  try {
    const userId = await getCurrentUserId();
    const supabase = await getSupabaseClient();

    // Get sources (RLS ensures user can only see their own)
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error listing sources:', error);
      return {
        success: false,
        error: 'Failed to fetch sources'
      };
    }

    return {
      success: true,
      data: data as SourceRecord[]
    };

  } catch (error) {
    console.error('Error in listSources:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Verify source without saving
 */
export async function verifySource(input: VerifySourceInput): Promise<{ 
  ok: boolean; 
  meta?: Record<string, unknown>; 
  reason?: string; 
}> {
  try {
    // Validate input
    const validation = VerifySourceInputSchema.safeParse(input);
    if (!validation.success) {
      return {
        ok: false,
        reason: getSourceValidationError(validation.error)
      };
    }

    switch (input.type) {
      case 'x': {
        try {
          // Check if X API token is configured
          if (!process.env.X_BEARER_TOKEN) {
            console.error('X_BEARER_TOKEN environment variable is not set in server actions');
            return {
              ok: false,
              reason: 'X API not configured - please check environment variables'
            };
          }
          
          const userId = await getUserIdByHandle(input.handle!);
          if (userId) {
            return {
              ok: true,
              meta: { userId, handle: input.handle }
            };
          } else {
            return {
              ok: false,
              reason: 'X handle not found or invalid'
            };
          }
        } catch (error) {
          console.error('X verification error:', error);
          if (error instanceof Error) {
            if (error.message.includes('401')) {
              return {
                ok: false,
                reason: 'X API authentication failed - check your API token'
              };
            } else if (error.message.includes('404')) {
              return {
                ok: false,
                reason: 'X handle not found - please check the username'
              };
            } else if (error.message.includes('429')) {
              return {
                ok: false,
                reason: 'X API rate limit exceeded - please try again later'
              };
            } else {
              return {
                ok: false,
                reason: `X API error: ${error.message}`
              };
            }
          }
          return {
            ok: false,
            reason: 'Failed to verify X handle - unknown error'
          };
        }
      }

      case 'youtube': {
        try {
          const videoIds = await searchChannelVideos(input.handle!, 1);
          if (videoIds.length >= 1) {
            return {
              ok: true,
              meta: { channelId: input.handle, videoCount: videoIds.length }
            };
          } else {
            return {
              ok: false,
              reason: 'YouTube channel not found or has no videos'
            };
          }
        } catch (error) {
          return {
            ok: false,
            reason: 'Failed to verify YouTube channel'
          };
        }
      }

      case 'rss': {
        try {
          const items = await fetchRss(input.url!, 1);
          if (items.length >= 1) {
            return {
              ok: true,
              meta: { 
                feedTitle: items[0]?.title || 'RSS Feed',
                itemCount: items.length,
                sampleItem: items[0]
              }
            };
          } else {
            return {
              ok: false,
              reason: 'RSS feed is empty or invalid'
            };
          }
        } catch (error) {
          return {
            ok: false,
            reason: 'Failed to fetch RSS feed'
          };
        }
      }

      case 'blog': {
        try {
          const results = await extractUrls([input.url!]);
          if (results.length > 0 && (results[0].markdown || results[0].metadata?.title)) {
            return {
              ok: true,
              meta: { 
                url: input.url,
                hasContent: true,
                title: results[0].metadata?.title || 'Blog'
              }
            };
          } else {
            return {
              ok: false,
              reason: 'Blog URL could not be processed'
            };
          }
        } catch (error) {
          return {
            ok: false,
            reason: 'Failed to process blog URL'
          };
        }
      }

      default:
        return {
          ok: false,
          reason: 'Unknown source type'
        };
    }

  } catch (error) {
    console.error('Error in verifySource:', error);
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
