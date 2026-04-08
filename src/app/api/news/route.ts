import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) {
    return NextResponse.json({ items: [] });
  }

  try {
    // We target security, conflict, and advisory keywords specifically
    const query = encodeURIComponent(`${q} security unrest protest advisory conflict`);
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-GL&gl=GL&ceid=GL:en`;
    
    const response = await fetch(rssUrl, { next: { revalidate: 1800 } }); // Cache for 30 mins
    if (!response.ok) throw new Error('News fetch failed');
    
    const text = await response.text();
    
    // Simple Regex-based RSS parser for Edge compatibility
    const items: any[] = [];
    const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/g);
    
    for (const match of itemMatches) {
      const content = match[1];
      const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = content.match(/<link>([\s\S]*?)<\/link>/);
      const dateMatch = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = content.match(/<source[^>]*>([\s\S]*?)<\/source>/);
      
      if (titleMatch && linkMatch) {
        const fullTitle = titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
        // Google News format is often "Headline - Source"
        const parts = fullTitle.split(' - ');
        const source = sourceMatch ? sourceMatch[1] : (parts.length > 1 ? parts.pop() : 'News');
        const title = parts.join(' - ');

        items.push({
          id: Math.random().toString(36).substring(7),
          title: title,
          link: linkMatch[1],
          source: source,
          date: dateMatch ? dateMatch[1] : new Date().toISOString(),
          relevance: title.toLowerCase().includes('security') || title.toLowerCase().includes('conflict') ? 'high' : 'moderate'
        });
      }
      
      if (items.length >= 10) break; // Limit to top 10 headlines
    }

    return NextResponse.json({
      items,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('NEWS_PROXY_ERROR:', error);
    return NextResponse.json({ items: [], error: 'Headlines temporarily unavailable' });
  }
}
