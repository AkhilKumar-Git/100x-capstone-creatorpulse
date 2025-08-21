import { sbClient } from "@/lib/supabase/client";
import { StyleSample, StyleSampleInsert, StyleSampleUpdate } from "@/lib/database.types";

export async function listStyleSamplesClient(): Promise<StyleSample[]> {
  try {
    const { data, error } = await sbClient()
      .from("style_samples")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error listing style samples:", error);
    throw new Error("Failed to load style samples");
  }
}

export async function createStyleSampleClient(
  input: StyleSampleInsert
): Promise<StyleSample> {
  try {
    const { data, error } = await sbClient()
      .from("style_samples")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating style sample:", error);
    throw new Error("Failed to create style sample");
  }
}

export async function updateStyleSampleClient(
  id: string,
  input: StyleSampleUpdate
): Promise<StyleSample> {
  try {
    const { data, error } = await sbClient()
      .from("style_samples")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating style sample:", error);
    throw new Error("Failed to update style sample");
  }
}

export async function deleteStyleSampleClient(id: string): Promise<void> {
  try {
    const { error } = await sbClient()
      .from("style_samples")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting style sample:", error);
    throw new Error("Failed to delete style sample");
  }
}

export async function embedAndCreateStyleSample(
  content: string,
  platform: string
): Promise<StyleSample> {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await sbClient().auth.getUser();
    
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Validate platform against database schema
    const validPlatforms = ['x', 'linkedin', 'instagram', 'twitter', 'tiktok', 'youtube', 'blog'] as const;
    if (!validPlatforms.includes(platform as typeof validPlatforms[number])) {
      throw new Error(`Invalid platform: ${platform}. Must be one of: ${validPlatforms.join(', ')}`);
    }

    // Call the API to generate embedding and create the sample
    const response = await fetch("/api/style/embed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platform: platform as 'x' | 'linkedin' | 'instagram',
        lines: [content], // API expects array of strings
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.reason || "Failed to generate embedding");
    }

    const result = await response.json();
    
    // Fetch the created style sample(s) from database
    const { data: samples, error } = await sbClient()
      .from("style_samples")
      .select("*")
      .eq("user_id", user.id)
      .eq("platform", platform)
      .eq("raw_text", content)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !samples || samples.length === 0) {
      throw new Error("Failed to retrieve created style sample");
    }

    return samples[0];
  } catch (error) {
    console.error("Error embedding and creating style sample:", error);
    throw new Error("Failed to create style sample with embedding");
  }
}

export async function updateStyleSampleWithEmbedding(
  id: string,
  content: string,
  platform: string
): Promise<StyleSample> {
  try {
    // Validate platform against database schema
    const validPlatforms = ['x', 'linkedin', 'instagram', 'twitter', 'tiktok', 'youtube', 'blog'] as const;
    if (!validPlatforms.includes(platform as typeof validPlatforms[number])) {
      throw new Error(`Invalid platform: ${platform}. Must be one of: ${validPlatforms.join(', ')}`);
    }

    // First, update the style sample
    const updatedSample = await updateStyleSampleClient(id, {
      raw_text: content,
      platform: platform as 'x' | 'linkedin' | 'instagram',
    });

    // Then, regenerate the embedding
    const response = await fetch("/api/style/embed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platform: platform as 'x' | 'linkedin' | 'instagram',
        lines: [content], // API expects array of strings
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.reason || "Failed to regenerate embedding");
    }

    return updatedSample;
  } catch (error) {
    console.error("Error updating style sample with embedding:", error);
    throw new Error("Failed to update style sample with embedding");
  }
}
