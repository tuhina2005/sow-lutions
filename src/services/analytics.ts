import axios from 'axios';

interface AnalyticsData {
  name: string;
  value: number;
}

export async function fetchAnalyticsData(region: string, crop: string): Promise<{
  yieldData: AnalyticsData[];
  waterData: AnalyticsData[];
}> {
  try {
    // Make an API call to fetch price data
    const apiResponse = await axios.post('http://localhost:1234/predict', {
      region,
      crop,
    });

    // Assuming the API returns an array of prices for the next 30 days
    const prices: number[] = apiResponse.data.prices;
    console.log('Fetched price data:', prices);
    // Map prices to AnalyticsData format
    const yieldData = prices.map((price, index) => ({
      name: (index + 1).toString(),
      value: price,
    }));
    console.log('Price data:', yieldData);
    // Generate waterData as random values for demo purposes
    const waterData = Array.from({ length: 30 }, (_, i) => ({
      name: (i + 1).toString(),
      value: Math.floor(Math.random() * 300) + 200, // Random values between 200-500
    }));
    console.log('Price data:', waterData);


    return { yieldData, waterData };
  } catch (error) {
    console.error('Error fetching price data:', error);
    throw new Error('Failed to fetch price data. Please try again later.');
  }
}
