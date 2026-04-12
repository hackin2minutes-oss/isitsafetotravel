import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') || '5';

  if (!query) {
    return NextResponse.json({ error: 'q (query) is required' }, { status: 400 });
  }

  try {
    // Search Wikipedia for matching articles
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${limit}&namespace=0&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    const titles: string[] = searchData[1] || [];
    const snippets: string[] = searchData[2] || [];

    if (titles.length === 0) {
      return NextResponse.json({ articles: [], message: 'No Wikipedia articles found' });
    }

    // Fetch summaries for each title
    const articles = await Promise.all(
      titles.map(async (title: string, index: number) => {
        try {
          const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
          const summaryRes = await fetch(summaryUrl);
          
          if (!summaryRes.ok) {
            return {
              title,
              extract: snippets[index] || '',
              description: '',
              thumbnail: null,
              url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
            };
          }

          const summary = await summaryRes.json();
          
          return {
            title: summary.title,
            extract: summary.extract || snippets[index] || '',
            description: summary.description || '',
            thumbnail: summary.thumbnail?.source || null,
            url: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
          };
        } catch {
          return {
            title,
            extract: snippets[index] || '',
            description: '',
            thumbnail: null,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
          };
        }
      })
    );

    return NextResponse.json({ articles, count: articles.length });
  } catch (error) {
    console.error('Wikipedia API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Wikipedia data' }, { status: 500 });
  }
}
