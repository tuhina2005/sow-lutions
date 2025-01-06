import { useState, useCallback } from 'react';
import { NewsFilters } from '../types/news';

export function useNewsFilters() {
  const [filters, setFilters] = useState<NewsFilters>({
    search: '',
    category: 'All News'
  });

  const updateSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const updateCategory = useCallback((category: string) => {
    setFilters(prev => ({ ...prev, category }));
  }, []);

  return { filters, updateSearch, updateCategory };
}