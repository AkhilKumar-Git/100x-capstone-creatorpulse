// lib/ingestion/firecrawl.ts
// Extract structured markdown from URLs (or crawl a domain).
const FC_BASE = "https://api.firecrawl.dev/v1";

const fcHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${process.env.FIRECRAWL_API_KEY!}`,
});

export type ExtractResult = {
  url: string;
  markdown?: string;
  metadata?: Record<string, any>;
};

export async function extractUrls(urls: string[]): Promise<ExtractResult[]> {
  const r = await fetch(`${FC_BASE}/extract`, {
    method: "POST",
    headers: fcHeaders(),
    body: JSON.stringify({
      urls,
      // optional: custom schema or prompt for structured extraction
      prompt: "Summarize in 5 bullets and capture headings + key facts.",
      process_pdf: true, // handle newsletter PDFs too
    }),
  });
  if (!r.ok) throw new Error(`Firecrawl extract failed: ${r.status}`);
  const j = await r.json();
  return j.results ?? [];
}

export async function crawlSite(startUrl: string, maxPages = 20) {
  const r = await fetch(`${FC_BASE}/crawl`, {
    method: "POST",
    headers: fcHeaders(),
    body: JSON.stringify({
      url: startUrl,
      limit: maxPages,
      include_links: false,
      concurrency: 4,
    }),
  });
  if (!r.ok) throw new Error(`Firecrawl crawl failed: ${r.status}`);
  return r.json();
}
