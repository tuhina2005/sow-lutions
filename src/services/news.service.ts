import { NEWS_CONFIG } from '../config/news.config';
import { NewsItem, NewsFilters } from '../types/news';

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Array<{
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    source: { name: string };
    publishedAt: string;
  }>;
}

function generateIdFromUrl(url: string): string {
  return btoa(url).replace(/[/+=]/g, '');
}

export async function fetchNews(filters: NewsFilters): Promise<NewsItem[]> {
  try {
    const { category, search } = filters;
    const params = new URLSearchParams({
      apiKey: NEWS_CONFIG.apiKey,
      language: 'en',
      pageSize: '20',
    });

    // India-specific news sources
    const indianSources = [
      'the-hindu',
      'the-times-of-india',
      'the-economic-times',
      'business-standard',
      'mint',
      'hindu-business-line'
    ].join(',');
    
    // Category-specific keywords with Indian context
    const categoryKeywords = {
      technology: '(India OR Indian) AND (agritech OR "agricultural technology" OR "farm technology" OR "smart farming" OR "digital agriculture" OR "precision farming" OR "agricultural innovation")',
      business: '(India OR Indian) AND (agribusiness OR "agricultural market" OR "farm business" OR "agricultural policy" OR "MSP" OR "minimum support price" OR "agricultural trade" OR "farm laws" OR "agricultural reforms")',
      science: '(India OR Indian) AND (agricultural research OR "farm research" OR "agricultural science" OR "climate change agriculture" OR ICAR OR "agricultural university" OR "crop research" OR "agricultural study")',
    };

    // Always use /everything endpoint for better control
    const baseQuery = category && category !== 'all'
      ? categoryKeywords[category as keyof typeof categoryKeywords]
      : search
        ? `(India OR Indian) AND (${search}) AND (agriculture OR farming OR agribusiness OR "agricultural sector")`
        : '(India OR Indian) AND (agriculture OR farming OR agribusiness OR "agricultural sector")';

    params.append('q', baseQuery);
    params.append('domains', 'thehindubusinessline.com,economictimes.indiatimes.com,timesofindia.indiatimes.com,business-standard.com,livemint.com,thehindu.com,krishijagran.com,agrifarming.in,indianexpress.com');
    params.append('sortBy', 'publishedAt');

    const url = `${NEWS_CONFIG.baseUrl}/everything?${params}`;
    console.log('Fetching news with URL:', url);
    console.log('Search filters:', filters);
    console.log('Query:', baseQuery);

    const response = await fetch(url);
    const data: NewsAPIResponse = await response.json();

    console.log('API Response status:', data.status);
    console.log('Total results:', data.totalResults);

    if (!response.ok) {
      console.error('API Error:', data);
      throw new Error(`Failed to fetch news. Status: ${response.status}`);
    }

    if (data.totalResults === 0) {
      console.log('No results found for query:', params.toString());
    }

    return data.articles.map((article) => ({
      id: generateIdFromUrl(article.url),
      title: article.title,
      description: article.description || '',
      imageUrl: article.urlToImage || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449',
      source: article.source.name,
      publishedAt: new Date(article.publishedAt),
      url: article.url,
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}