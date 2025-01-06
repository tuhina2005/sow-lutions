import React from 'react';
import PageTransition from '../components/shared/PageTransition';
import NewsGrid from '../components/news/NewsGrid';
import NewsFilters from '../components/news/NewsFilters';
import { useNewsFilters } from '../hooks/useNewsFilters';

export default function News() {
  const { filters, updateSearch, updateCategory } = useNewsFilters();

  return (
    <PageTransition>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Agriculture News</h1>
        <NewsFilters 
          filters={filters}
          onSearchChange={updateSearch}
          onCategoryChange={updateCategory}
        />
        <NewsGrid filters={filters} />
      </div>
    </PageTransition>
  );
}