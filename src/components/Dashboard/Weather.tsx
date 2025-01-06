import React, { useEffect, useState } from 'react';

interface WeatherData {
  name: string;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: {
    description: string;
  }[];
  wind: {
    speed: number;
  };
}

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Yakutsk&units=metric&appid=0f5a2eb7ee228e0d0cc4b7bd3426a17e`
        );
        const data: WeatherData = await response.json();
        console.log(data);
        setWeather(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!weather) {
    return <div>Error loading weather data.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Weather</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800">
          {weather.name}, {weather.sys.country}
        </h2>
        <p className="text-gray-600">
          {weather.weather[0].description.charAt(0).toUpperCase() +
            weather.weather[0].description.slice(1)}
        </p>
        <p className="text-4xl font-bold mt-2">
          {Math.round(weather.main.temp)}°C
        </p>
        <p className="text-gray-600">
          Feels like: {Math.round(weather.main.feels_like)}°C
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Humidity</div>
            <div className="font-semibold">{weather.main.humidity}%</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Wind Speed</div>
            <div className="font-semibold">{weather.wind.speed} m/s</div>
          </div>
        </div>
      </div>
    </div>
  );
}