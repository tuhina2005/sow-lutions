export interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  source: string;
  publishedAt: Date;
  url: string;
  category?: string;
}

export interface NewsFilters {
  search: string;
  category: string;
}