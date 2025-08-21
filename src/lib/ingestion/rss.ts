// lib/ingestion/rss.ts
// Fetch and parse RSS feeds to extract recent posts/articles.

export type RSSItem = {
  id: string;
  title: string;
  description?: string;
  link: string;
  publishedAt: string;
  author?: string;
  categories?: string[];
};

export type RSSFeed = {
  title: string;
  description?: string;
  link: string;
  items: RSSItem[];
};

/**
 * Fetch and parse an RSS feed
 * @param url - The RSS feed URL
 * @param maxItems - Maximum number of items to return (default: 10)
 * @returns Parsed RSS feed with items
 */
export async function fetchRss(url: string, maxItems = 10): Promise<RSSItem[]> {
  try {
    // Fetch the RSS feed
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CreatorPulse/1.0 (RSS Fetcher)',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    // Parse XML using DOMParser (client-side) or a server-side XML parser
    const items = await parseRSSXML(xmlText, maxItems);
    
    return items;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`RSS fetch failed: ${error.message}`);
    }
    throw new Error('RSS fetch failed: Unknown error');
  }
}

/**
 * Parse RSS XML content
 * @param xmlText - Raw XML text
 * @param maxItems - Maximum items to return
 * @returns Array of RSS items
 */
async function parseRSSXML(xmlText: string, maxItems: number): Promise<RSSItem[]> {
  // For server-side, we'll use a simple regex-based parser
  // In production, you might want to use a proper XML parser like 'fast-xml-parser'
  
  const items: RSSItem[] = [];
  
  // Extract items using regex (basic but effective for most RSS feeds)
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  let count = 0;
  
  while ((match = itemRegex.exec(xmlText)) && count < maxItems) {
    const itemContent = match[1];
    
    try {
      const item = extractRSSItem(itemContent);
      if (item) {
        items.push(item);
        count++;
      }
    } catch (error) {
      // Skip malformed items
      console.warn('Skipping malformed RSS item:', error);
    }
  }
  
  return items;
}

/**
 * Extract individual RSS item from XML content
 * @param itemContent - XML content for a single item
 * @returns Parsed RSS item or null if invalid
 */
function extractRSSItem(itemContent: string): RSSItem | null {
  try {
    const title = extractTag(itemContent, 'title')?.trim();
    const link = extractTag(itemContent, 'link')?.trim();
    const description = extractTag(itemContent, 'description')?.trim();
    const pubDate = extractTag(itemContent, 'pubDate')?.trim();
    const author = extractTag(itemContent, 'author')?.trim();
    const categories = extractTags(itemContent, 'category');
    
    // Validate required fields
    if (!title || !link) {
      return null;
    }
    
    // Generate a unique ID from link and title
    const id = generateItemId(link, title);
    
    // Parse publication date
    const publishedAt = pubDate ? parseDate(pubDate) : new Date().toISOString();
    
    return {
      id,
      title,
      description,
      link,
      publishedAt,
      author,
      categories,
    };
  } catch (error) {
    console.warn('Error extracting RSS item:', error);
    return null;
  }
}

/**
 * Extract content from XML tag
 * @param content - XML content
 * @param tagName - Tag name to extract
 * @returns Tag content or undefined
 */
function extractTag(content: string, tagName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = content.match(regex);
  return match?.[1]?.replace(/<[^>]*>/g, ''); // Remove nested tags
}

/**
 * Extract multiple tags from XML content
 * @param content - XML content
 * @param tagName - Tag name to extract
 * @returns Array of tag contents
 */
function extractTags(content: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  const matches = content.matchAll(regex);
  const results: string[] = [];
  
  for (const match of matches) {
    const value = match[1]?.replace(/<[^>]*>/g, '').trim();
    if (value) {
      results.push(value);
    }
  }
  
  return results;
}

/**
 * Generate a unique ID for RSS item
 * @param link - Item link
 * @param title - Item title
 * @returns Unique ID string
 */
function generateItemId(link: string, title: string): string {
  const hash = link + title;
  let result = 0;
  for (let i = 0; i < hash.length; i++) {
    result = ((result << 5) - result + hash.charCodeAt(i)) & 0xffffffff;
  }
  return result.toString(36);
}

/**
 * Parse various date formats to ISO string
 * @param dateString - Date string in various formats
 * @returns ISO date string
 */
function parseDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Validate if a URL is a valid RSS feed
 * @param url - URL to validate
 * @returns Promise<boolean> - True if valid RSS feed
 */
export async function validateRSSFeed(url: string): Promise<boolean> {
  try {
    const items = await fetchRss(url, 1);
    return items.length > 0;
  } catch {
    return false;
  }
}
