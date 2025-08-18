// lib/ingestion/youtube.ts
// Get recent videos from a channel and hydrate with snippet/description/stats.
const YT_BASE = "https://www.googleapis.com/youtube/v3";

export type YTVideo = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channelId: string;
};

const key = process.env.YOUTUBE_API_KEY!;

export async function searchChannelVideos(channelId: string, max = 25): Promise<string[]> {
  const url = new URL(`${YT_BASE}/search`);
  url.searchParams.set("key", key);
  url.searchParams.set("channelId", channelId);
  url.searchParams.set("part", "id");
  url.searchParams.set("order", "date");
  url.searchParams.set("maxResults", String(Math.min(max, 50)));
  url.searchParams.set("type", "video");
  const r = await fetch(url);
  if (!r.ok) throw new Error(`YT search failed: ${r.status}`);
  const j = await r.json();
  return (j.items ?? []).map((it: any) => it.id.videoId).filter(Boolean);
}

export async function getVideos(videoIds: string[]): Promise<YTVideo[]> {
  if (!videoIds.length) return [];
  const url = new URL(`${YT_BASE}/videos`);
  url.searchParams.set("key", key);
  url.searchParams.set("id", videoIds.join(","));
  url.searchParams.set("part", "snippet");
  const r = await fetch(url);
  if (!r.ok) throw new Error(`YT videos.list failed: ${r.status}`);
  const j = await r.json();
  return (j.items ?? []).map((it: any) => ({
    id: it.id,
    title: it.snippet.title,
    description: it.snippet.description,
    publishedAt: it.snippet.publishedAt,
    channelId: it.snippet.channelId,
  }));
}
