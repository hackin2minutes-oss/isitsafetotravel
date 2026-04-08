import { NewsData } from '@/types';

export async function getGeopoliticalNews(query: string): Promise<NewsData | null> {
  try {
    const response = await fetch(`/api/news?q=${encodeURIComponent(query)}`);
    if (!response.ok) return null;
    return await response.json() as NewsData;
  } catch (error) {
    console.error('NewsService Error:', error);
    return null;
  }
}
