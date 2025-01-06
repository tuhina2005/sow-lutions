export const NEWS_CONFIG = {
  apiKey: import.meta.env.VITE_NEWS_API_KEY,
  baseUrl: 'https://newsapi.org/v2',
  defaultParams: {
    language: 'en',
    pageSize: 12,
    country: 'in', // Added country parameter for India
    q: 'agriculture OR farming OR crops OR "agricultural technology"',
  }
};