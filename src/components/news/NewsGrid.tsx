import React from 'react';
import NewsCard from './NewsCard';
import { useNews } from '../../hooks/useNews';
import { NewsFilters } from '../../types/news';

interface NewsGridProps {
  filters: NewsFilters;
}

export default function NewsGrid({ filters }: NewsGridProps) {
  const { news, loading, error } = useNews(filters);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-t-lg" />
            <div className="p-4 bg-white rounded-b-lg">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-2">Failed to load news. Please try again later.</p>
        <p className="text-gray-600 text-sm">Make sure you have set up your NewsAPI key in the .env file</p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center text-gray-600 py-8">
        No news articles found for the current filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item) => (
        <NewsCard key={item.id} {...item} />
      ))}
    </div>
  );
}