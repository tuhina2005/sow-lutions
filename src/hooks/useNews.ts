import { useState, useEffect } from 'react';
import { NewsItem, NewsFilters } from '../types/news';
import { fetchNews } from '../services/news.service';

export function useNews(filters: NewsFilters) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getNews = async () => {
      try {
        setLoading(true);
        const articles = await fetchNews(filters);
        setNews(articles);
        setError(null);
      } catch (err) {
        setError('Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    getNews();
  }, [filters]);

  return { news, loading, error };
}