import { NextResponse } from "next/server";
import { sbServer } from "@/lib/supabase/server";
import { getUserIdByHandle } from "@/lib/ingestion/x";
import { searchChannelVideos } from "@/lib/ingestion/youtube";
import { extractUrls } from "@/lib/ingestion/firecrawl";
import { fetchRss } from "@/lib/ingestion/rss";

export async function POST(req: Request) {
  try {
    const supabase = await sbServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
    }

    const { type, handle, url } = await req.json();

    if (type === "x") {
      const cleanHandle = (handle || "").replace(/^@/, "");
      if (!cleanHandle) {
        return NextResponse.json({ ok: false, reason: "X handle is required" });
      }
      
      const userId = await getUserIdByHandle(cleanHandle);
      return NextResponse.json(
        userId 
          ? { ok: true, meta: { userId, handle: cleanHandle } } 
          : { ok: false, reason: "X handle not found" }
      );
    }

    if (type === "youtube") {
      if (!handle) {
        return NextResponse.json({ ok: false, reason: "YouTube channel handle is required" });
      }
      
      const videos = await searchChannelVideos(handle, 1);
      return NextResponse.json(
        videos.length 
          ? { ok: true, meta: { channelId: handle, videoCount: videos.length } } 
          : { ok: false, reason: "YouTube channel not found or has no videos" }
      );
    }

    if (type === "rss") {
      if (!url) {
        return NextResponse.json({ ok: false, reason: "RSS feed URL is required" });
      }
      
      const items = await fetchRss(url, 1);
      return NextResponse.json(
        items.length 
          ? { ok: true, meta: { feedTitle: items[0]?.title || 'RSS Feed', itemCount: items.length } } 
          : { ok: false, reason: "RSS feed is empty or invalid" }
      );
    }

    if (type === "blog") {
      if (!url) {
        return NextResponse.json({ ok: false, reason: "Blog URL is required" });
      }
      
      const results = await extractUrls([url]);
      const first = results?.[0];
      return NextResponse.json(
        (first?.markdown || first?.metadata?.title) 
          ? { ok: true, meta: { title: first.metadata?.title || 'Blog', hasContent: true } } 
          : { ok: false, reason: "Blog URL could not be processed" }
      );
    }

    return NextResponse.json({ ok: false, reason: "unsupported source type" }, { status: 400 });

  } catch (error: any) {
    console.error('Source verification error:', error);
    return NextResponse.json(
      { ok: false, reason: error.message || 'Verification failed' }, 
      { status: 500 }
    );
  }
}
