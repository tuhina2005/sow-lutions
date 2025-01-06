import React from 'react';
import { Search } from 'lucide-react';
import { NewsFilters as NewsFiltersType } from '../../types/news';

interface NewsFiltersProps {
  filters: NewsFiltersType;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
}

// Define mapping between display categories and API categories
const categoryMapping = {
  'All News': 'all',
  'Technology': 'technology',
  'Policy': 'business',
  'Market Trends': 'business',
  'Climate': 'science',
  'Research': 'science'
};

type CategoryType = keyof typeof categoryMapping;

export default function NewsFilters({ filters, onSearchChange, onCategoryChange }: NewsFiltersProps) {
  // Function to get API category
  const getApiCategory = (displayCategory: string) => {
    return categoryMapping[displayCategory as CategoryType] || 'all';
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search agriculture news..."
          className="w-full px-4 py-2 pl-10 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {Object.keys(categoryMapping).map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(getApiCategory(category))}
            className={`px-4 py-2 text-sm rounded-full transition-colors ${
              filters.category === getApiCategory(category)
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 hover:bg-green-50 hover:border-green-500'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}