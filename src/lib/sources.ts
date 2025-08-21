import { sbClient } from './supabase/client';

export interface Source {
  id: string;
  user_id: string;
  type: 'x' | 'youtube' | 'rss' | 'blog';
  handle: string | null;
  url: string | null;
  active: boolean;
  created_at: string;
}

export interface CreateSourceInput {
  type: 'x' | 'youtube' | 'rss' | 'blog';
  handle?: string;
  url?: string;
}

export interface ToggleSourceInput {
  id: string;
  active: boolean;
}

export interface DeleteSourceInput {
  id: string;
}

export interface VerifySourceInput {
  type: 'x' | 'youtube' | 'rss' | 'blog';
  handle?: string;
  url?: string;
}

/**
 * List user's sources (client-side)
 */
export async function listSourcesClient(): Promise<{ 
  success: boolean; 
  data?: Source[]; 
  error?: string; 
}> {
  try {
    const supabase = sbClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .eq('user_id', user.id)
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
      data: data as Source[]
    };

  } catch (error) {
    console.error('Error in listSourcesClient:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Create a new source (client-side)
 */
export async function createSourceClient(input: CreateSourceInput): Promise<{ 
  success: boolean; 
  data?: Source; 
  error?: string; 
  code?: string;
}> {
  try {
    const supabase = sbClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Check for duplicates
    const duplicateCheck = await supabase
      .from('sources')
      .select('id')
      .eq('user_id', user.id)
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
        user_id: user.id,
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

    return {
      success: true,
      data: data as Source
    };

  } catch (error) {
    console.error('Error in createSourceClient:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Toggle source active status (client-side)
 */
export async function toggleSourceClient(input: ToggleSourceInput): Promise<{ 
  success: boolean; 
  error?: string; 
}> {
  try {
    const supabase = sbClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const { error } = await supabase
      .from('sources')
      .update({ active: input.active })
      .eq('id', input.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error toggling source:', error);
      return {
        success: false,
        error: 'Failed to update source'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Error in toggleSourceClient:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Delete a source (client-side)
 */
export async function deleteSourceClient(input: DeleteSourceInput): Promise<{ 
  success: boolean; 
  error?: string; 
}> {
  try {
    const supabase = sbClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const { error } = await supabase
      .from('sources')
      .delete()
      .eq('id', input.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting source:', error);
      return {
        success: false,
        error: 'Failed to delete source'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Error in deleteSourceClient:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Verify a source (client-side call to API route)
 */
export async function verifySourceClient(input: VerifySourceInput): Promise<{ 
  ok: boolean; 
  meta?: Record<string, unknown>; 
  reason?: string; 
}> {
  try {
    const response = await fetch("/api/sources/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error in verifySourceClient:', error);
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}
