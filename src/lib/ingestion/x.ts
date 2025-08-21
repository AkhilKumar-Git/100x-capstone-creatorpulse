// lib/ingestion/x.ts
// Fetch recent posts from a user and/or keyword search (public data only).
const X_BASE = "https://api.twitter.com/2";

export type XPost = {
  id: string;
  text: string;
  created_at: string;
  author_id?: string;
};

const authHeader = () => {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    console.error('X_BEARER_TOKEN environment variable is not set');
    throw new Error('X API token not configured');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export async function getUserIdByHandle(handle: string) {
  try {
    console.log('Attempting to verify X handle:', handle);
    console.log('Using X API endpoint:', X_BASE);
    
    const r = await fetch(`${X_BASE}/users/by/username/${handle}`, {
      headers: authHeader(),
    });
    
    console.log('X API response status:', r.status);
    
    if (!r.ok) {
      const errorText = await r.text();
      console.error('X API error response:', errorText);
      throw new Error(`X users/by/username failed: ${r.status} - ${errorText}`);
    }
    
    const responseData = await r.json();
    console.log('X API response data:', responseData);
    
    const userId = responseData?.data?.id;
    if (userId) {
      console.log('Successfully verified X handle, user ID:', userId);
      return userId;
    } else {
      console.log('X handle verification failed - no user ID in response');
      return null;
    }
  } catch (error) {
    console.error('Error in getUserIdByHandle:', error);
    throw error;
  }
}

export async function getUserTweets(userId: string, max = 50): Promise<XPost[]> {
  const url = new URL(`${X_BASE}/users/${userId}/tweets`);
  url.searchParams.set("max_results", String(Math.min(max, 100)));
  url.searchParams.set("tweet.fields", "created_at,author_id");
  const r = await fetch(url, { headers: authHeader() });
  if (!r.ok) throw new Error(`X users/:id/tweets failed: ${r.status}`);
  const { data } = await r.json();
  return data ?? [];
}

export async function recentSearch(query: string, max = 50): Promise<XPost[]> {
  const url = new URL(`${X_BASE}/tweets/search/recent`);
  url.searchParams.set("query", query);
  url.searchParams.set("max_results", String(Math.min(max, 100)));
  url.searchParams.set("tweet.fields", "created_at,author_id");
  const r = await fetch(url, { headers: authHeader() });
  if (!r.ok) throw new Error(`X recent search failed: ${r.status}`);
  const { data } = await r.json();
  return data ?? [];
}
