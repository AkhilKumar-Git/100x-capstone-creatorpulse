// lib/ingestion/x.ts
// Fetch recent posts from a user and/or keyword search (public data only).
const X_BASE = "https://api.x.com/2";

export type XPost = {
  id: string;
  text: string;
  created_at: string;
  author_id?: string;
};

const authHeader = () => ({
  Authorization: `Bearer ${process.env.X_BEARER_TOKEN!}`,
});

export async function getUserIdByHandle(handle: string) {
  const r = await fetch(`${X_BASE}/users/by/username/${handle}`, {
    headers: authHeader(),
  });
  if (!r.ok) throw new Error(`X users/by/username failed: ${r.status}`);
  const { data } = await r.json();
  return data?.id as string;
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
